import React, { Component } from "react";
import PropTypes from "prop-types";
import { StyleSheet, ScrollView, View, Dimensions } from "react-native";

import Block from "./Block";

const styles = StyleSheet.create({
  itemsList: {
    flex: 1
  }
});

const SCREEN_WIDTH = Dimensions.get("window").width;

class DraggableGridView extends Component {
  constructor(props) {
    super(props);

    this.blockLayers = {};

    this.state = {
      isAnyBlockMoving: false,
      activeBlock: null
    };
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.data.length !== nextProps.data.length) {
      this.blockLayers = {};
    }

    return true;
  }

  // MARK: - Event handlers

  onDragGrant(blockKey) {
    this.setState({ activeBlock: blockKey });
    this.props.onDragGrant(blockKey);
  }

  onDragMove(x, y, dx, dy) {
    const currentPosition = { x: x + dx, y: y + dy };
    const closest = this.findClosestBlockLayerFrom(currentPosition);

    if (!this.state.isAnyBlockMoving && Object.keys(closest).length > 0) {
      this.reOrganizeBlockGrid(closest);
    }
  }

  onDragRelease() {
    this.setState({ activeBlock: null });
    const newLayerOrder = Object.keys(this.blockLayers).map(
      layerKey => this.blockLayers[layerKey]
    );

    const dataReOrdered = this.reOrderData(newLayerOrder);
    this.props.onDragRelease(dataReOrdered);
  }

  // MARK: - Getters

  get items() {
    const { data, lastItem } = this.props;

    if (lastItem) {
      lastItem.key = "lastItem";
    }

    return lastItem
      ? data.map(item => this.props.renderItem(item)).concat([lastItem])
      : data.map(item => this.props.renderItem(item));
  }

  get itemsLength() {
    return this.items.length;
  }

  get wrapperStyle() {
    const { itemsPerRow, itemHeight } = this.props;
    const height =
      (Math.round(this.itemsLength / itemsPerRow) + 1) * itemHeight;

    return { height };
  }

  get isAnyBlockMoving() {
    return this.state.activeBlock != null;
  }

  get activeBlockLayer() {
    const currentBlockOrder = this.orderFor(this.state.activeBlock);
    return Object.assign({}, this.blockLayers[currentBlockOrder]);
  }

  // MARK: - Helper methods

  reOrderData(newLayerOrder) {
    const { keyField } = this.props;
    const dataReOrdered = [];

    newLayerOrder.forEach(newLayer => {
      const key = newLayer.key;
      const element = this.props.data.filter(data => data[keyField] === key)[0];

      if (element) {
        dataReOrdered.push(element);
      }
    });

    return dataReOrdered;
  }

  findClosestBlockLayerFrom(current) {
    let closest = { x: SCREEN_WIDTH, y: SCREEN_WIDTH };

    Object.keys(this.blockLayers).forEach(blockPositionKey => {
      const blockPosition = this.blockLayers[blockPositionKey];

      if (
        this.distanceBetween(current, blockPosition) <
        SCREEN_WIDTH / this.props.itemsPerRow
      ) {
        closest = blockPosition;
      }
    });

    if (this.props.lastItem && closest.key === this.itemsLength - 1) {
      return this.blockLayers[closest.key - 1];
    }

    return closest;
  }

  generateKeyForItem(itemIndex) {
    return itemIndex;
  }

  coordinatesFrom(index) {
    const { itemsPerRow } = this.props;
    const row = Math.floor(index / itemsPerRow, -1);
    const column = index % itemsPerRow;

    return { row, column };
  }

  createBlockLayer(index, key) {
    const { itemsPerRow, itemHeight } = this.props;
    const { row, column } = this.coordinatesFrom(index);
    const itemWidth = SCREEN_WIDTH / itemsPerRow;

    const blockPosition = {
      key,
      x: itemWidth * column,
      y: itemHeight * row,
      width: itemWidth,
      height: itemHeight
    };

    if (typeof this.blockLayers[index] === "undefined") {
      this.blockLayers[index] = blockPosition;
    }
  }

  distanceBetween(positionOne, positionTwo) {
    const xDistance = Math.abs(positionOne.x - positionTwo.x);
    const xDistanceSquare = xDistance * xDistance;

    const yDistance = Math.abs(positionOne.y - positionTwo.y);
    const yDistanceSquare = yDistance * yDistance;

    return Math.sqrt(xDistanceSquare + yDistanceSquare);
  }

  reOrganizeBlockGrid(closest) {
    const currentKey = this.state.activeBlock;
    const nextKey = closest.key;

    if (nextKey === currentKey) {
      return;
    }

    const currentBlockOrder = this.orderFor(currentKey);
    const nextBlockOrder = this.orderFor(nextKey);

    if (
      currentBlockOrder !== -1 &&
      nextBlockOrder !== -1 &&
      nextKey !== this.props.lastItem.key
    ) {
      this.blockLayers[currentBlockOrder] = Object.assign(
        this.blockLayers[currentBlockOrder],
        {
          key: nextKey
        }
      );
      this.blockLayers[nextBlockOrder] = Object.assign(
        this.blockLayers[nextBlockOrder],
        {
          key: currentKey
        }
      );
      this.forceUpdate();
    }
  }

  orderFor(key) {
    let order = -1;

    Object.keys(this.blockLayers).forEach(layerOrder => {
      const layerKey = this.blockLayers[layerOrder].key;
      if (key === layerKey) {
        order = layerOrder;
      }
    });

    return order;
  }

  isBlockMoving(isAnyBlockMoving) {
    this.setState({ isAnyBlockMoving });
  }

  // MARK: - Render methods

  renderBlocks() {
    return this.items.map((item, index) => {
      this.createBlockLayer(index, item.key);

      return (
        <Block
          onDragGrant={blockKey => this.onDragGrant(blockKey)}
          onDragMove={(x, y, dx, dy) => this.onDragMove(x, y, dx, dy)}
          onDragRelease={() => this.onDragRelease()}
          isBlockMoving={isMoving => this.isBlockMoving(isMoving)}
          key={item.key}
          layer={this.blockLayers[this.orderFor(item.key)]}
          order={index}
        >
          {item}
        </Block>
      );
    });
  }

  render() {
    const { activeBlock } = this.state;

    return (
      <ScrollView scrollEnabled={activeBlock === null} style={styles.itemsList}>
        <View style={this.wrapperStyle}>{this.renderBlocks()}</View>
      </ScrollView>
    );
  }
}

DraggableGridView.defaultProps = {
  lastItem: undefined,
  keyField: "key",
  onDragRelease: () => {},
  onDragGrant: () => {}
};

DraggableGridView.propTypes = {
  data: PropTypes.array.isRequired,
  keyField: PropTypes.string,
  onDragRelease: PropTypes.func,
  onDragGrant: PropTypes.func,
  itemsPerRow: PropTypes.number.isRequired,
  itemHeight: PropTypes.number.isRequired,
  lastItem: PropTypes.object
};

export default DraggableGridView;
