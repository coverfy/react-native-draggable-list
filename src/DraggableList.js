import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, ScrollView, View, Dimensions } from 'react-native';

import Block from './Block';

const styles = StyleSheet.create({
  itemsList: {
    flex: 1,
  },
});

const SCREEN_WIDTH = Dimensions.get('window').width;

class DraggableGridView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      blockLayersArray: [],
      isAnyBlockMoving: false,
      activeBlock: null,
      activeBlockIndex: -1,
    };
  }

  // MARK: - Event handlers

  onDragGrant(blockKey, index) {
    this.setState({ activeBlock: blockKey, activeBlockIndex: index });
    this.props.onDragGrant(blockKey);
  }

  onDragMove(x, y, dx, dy) {
    const currentPosition = { x: x + dx, y: y + dy };
    const closestBlockInfo = this.findClosestBlockLayerFrom(currentPosition);

    if (!this.state.isAnyBlockMoving && Object.keys(closestBlockInfo.closest).length > 0) {
      this.reOrganizeBlockGrid(closestBlockInfo);
    }
  }

  onDragRelease() {
    this.setState({ activeBlock: null, activeBlockIndex: -1 });
    this.props.onDragRelease(this.reOrderData());
  }

  // MARK: - Getters

  get items() {
    const { data, lastItem } = this.props;

    if (lastItem) {
      lastItem.key = 'lastItem';
    }

    return lastItem
      ? data.map(item => this.props.renderItem(item)).concat([lastItem])
      : data.map(item => this.props.renderItem(item));
  }

  get itemsLength() {
    const { data, lastItem } = this.props;

    return lastItem ? data.length : data.length;
  }

  get wrapperStyle() {
    const { itemsPerRow, itemHeight } = this.props;
    const height = (Math.round(this.itemsLength / itemsPerRow) + 1) * itemHeight;

    return { height };
  }

  get isAnyBlockMoving() {
    return this.state.activeBlock != null;
  }

  get activeBlockLayer() {
    return this.state.blockLayersArray[this.state.activeBlock];
  }

  // MARK: - Helper methods

  reOrderData() {
    const { keyField } = this.props;
    const dataReOrdered = [];

    this.state.blockLayersArray.forEach((newLayer) => {
      const { key } = newLayer;
      const element = this.props.data.filter(data => data[keyField] === key)[0];

      if (element) {
        dataReOrdered.push(element);
      }
    });

    return dataReOrdered;
  }

  findClosestBlockLayerFrom(current) {
    let closest = { x: SCREEN_WIDTH, y: SCREEN_WIDTH };
    let closestIndex = -1;

    this.state.blockLayersArray.forEach((blockPosition, index) => {
      if (this.distanceBetween(current, blockPosition) < SCREEN_WIDTH / this.props.itemsPerRow) {
        closest = blockPosition;
        closestIndex = index;
      }
    });

    if (this.props.lastItem && closest.key === this.itemsLength - 1) {
      return this.state.blockLayersArray[closest.key - 1];
    }

    return { closest, closestIndex };
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
      height: itemHeight,
    };

    if (typeof this.state.blockLayersArray[index] !== 'undefined') {
      this.state.blockLayersArray[index] = blockPosition;
    } else {
      this.state.blockLayersArray.push(blockPosition);
    }
  }

  distanceBetween(positionOne, positionTwo) {
    const xDistance = Math.abs(positionOne.x - positionTwo.x);
    const xDistanceSquare = xDistance * xDistance;

    const yDistance = Math.abs(positionOne.y - positionTwo.y);
    const yDistanceSquare = yDistance * yDistance;

    return Math.sqrt(xDistanceSquare + yDistanceSquare);
  }

  reOrganizeBlockGrid(closestBlockInfo) {
    const { activeBlockIndex } = this.state;
    const nextBlockIndex = closestBlockInfo.closestIndex;

    if (
      !this.state.blockLayersArray[activeBlockIndex] ||
      !this.state.blockLayersArray[nextBlockIndex] ||
      activeBlockIndex === nextBlockIndex
    ) {
      return;
    }

    const nextBlockKey = this.state.blockLayersArray[nextBlockIndex].key;
    const currentBlockKey = this.state.blockLayersArray[activeBlockIndex].key;

    if (!nextBlockKey) {
      return;
    }

    this.state.blockLayersArray[activeBlockIndex].key = nextBlockKey;
    this.state.blockLayersArray[nextBlockIndex].key = currentBlockKey;

    this.props.onDragMove(this.reOrderData());
  }

  orderFor(key) {
    let order = -1;

    this.state.blockLayersArray.forEach((layer, index) => {
      const layerKey = this.state.blockLayersArray[index].key;
      if (key === layerKey) {
        order = index;
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
          onDragGrant={blockKey => this.onDragGrant(blockKey, index)}
          onDragMove={(x, y, dx, dy) => this.onDragMove(x, y, dx, dy)}
          onDragRelease={() => this.onDragRelease()}
          isBlockMoving={isMoving => this.isBlockMoving(isMoving)}
          key={item.key}
          layer={this.state.blockLayersArray[index]}
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
  keyField: 'key',
};

DraggableGridView.propTypes = {
  renderItem: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  keyField: PropTypes.string,
  onDragRelease: PropTypes.func,
  onDragMove: PropTypes.func,
  onDragGrant: PropTypes.func,
  itemsPerRow: PropTypes.number.isRequired,
  itemHeight: PropTypes.number.isRequired,
  lastItem: PropTypes.object,
};

export default DraggableGridView;
