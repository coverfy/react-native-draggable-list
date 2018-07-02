import React, { Component } from 'react';
import { Platform, Animated, PanResponder, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  active: {
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : undefined,
    shadowColor: Platform.OS === 'ios' ? 'black' : undefined,
    shadowOpacity: Platform.OS === 'ios' ? 0.4 : undefined,
    shadowRadius: Platform.OS === 'ios' ? 3 : undefined,
    elevation: 4,
    zIndex: 80,
  },
  inactive: {
    shadowOffset: undefined,
    shadowColor: undefined,
    shadowOpacity: undefined,
    shadowRadius: undefined,
    elevation: 0,
    zIndex: 1,
  },
});

class Block extends Component {
  constructor(props) {
    super(props);

    const {
      x, y, width, height,
    } = props.layer;

    this.state = {
      isActive: false,
      pan: new Animated.ValueXY({ x: 0, y: 0 }),
      originalPosition: { x, y },
      position: new Animated.ValueXY({ x, y }),
      size: { height, width },
    };

    this.initPanGestureRecognizer();
  }

  componentDidUpdate(prevProps) {
    const { isActive } = this.state;

    if (!isActive && this.itemHasChangedPosition(this.props.layer, prevProps.layer)) {
      this.moveToPosition({ x: this.props.layer.x, y: this.props.layer.y });
    }
  }

  // MARK: - Event handler methods

  onDragRelease() {
    const newPosition = { x: this.props.layer.x, y: this.props.layer.y };

    this.props.onDragRelease();
    this.setState({ isActive: false, originalPosition: newPosition }, () => {
      this.moveToPosition(newPosition);
    });
  }

  onDragMove(e, { dx, dy }) {
    const { x, y } = this.props.layer;
    const { originalPosition } = this.state;

    const deltaX = this.calculateDrag(dx, x, originalPosition.x);
    const deltaY = this.calculateDrag(dy, y, originalPosition.y);

    this.props.onDragMove(x, y, deltaX, deltaY);
    this.state.pan.x.setValue(dx);
    this.state.pan.y.setValue(dy);
  }

  onDragGrant() {
    this.props.onDragGrant(this.props.layer.key);
    this.setState({ isActive: true });
  }

  // MARK: - Getters

  get itemStyle() {
    const { isActive, position, size } = this.state;
    const panStyle = { transform: this.state.pan.getTranslateTransform() };

    const blockStyle = {
      position: 'absolute',
      left: position.x,
      top: position.y,
      width: size.width,
      height: size.height,
    };

    return isActive
      ? [blockStyle, panStyle, styles.active]
      : [blockStyle, panStyle, styles.inactive];
  }

  // MARK: - Initializers

  initPanGestureRecognizer() {
    this.val = { x: 0, y: 0 };
    this.state.pan.addListener((value) => {
      this.val = value;
    });

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => this.onDragMove(e, gestureState),
      onPanResponderRelease: () => this.onDragRelease(),
      onPanResponderGrant: () => this.onDragGrant(),
    });
  }

  // MARK: Helpers

  moveToPosition(newPosition) {
    this.props.isBlockMoving(true);
    Animated.parallel([
      Animated.spring(this.state.position, {
        toValue: newPosition,
        friction: 15,
      }),
      Animated.spring(this.state.pan, {
        toValue: { x: 0, y: 0 },
        friction: 15,
      }),
    ]).start((event) => {
      if (event.finished) {
        this.props.isBlockMoving(false);
      }
    });
  }

  itemHasChangedPosition(nextLayer, previousLayer) {
    if (typeof nextLayer === 'undefined' || typeof previousLayer === 'undefined') {
      return false;
    }

    return nextLayer.x !== previousLayer.x || nextLayer.y !== previousLayer.y;
  }

  calculateDrag(delta, current, original) {
    if (current > original && delta > 0) {
      return delta - (current - original);
    } else if (current > original && delta < 0) {
      return delta + (original - current);
    }

    return delta;
  }

  // MARK: Render methods

  render() {
    const { children } = this.props;

    return (
      <Animated.View useNativeDriver {...this.panResponder.panHandlers} style={this.itemStyle}>
        {children}
      </Animated.View>
    );
  }
}

Block.propTypes = {
  onDragGrant: PropTypes.func.isRequired,
  onDragMove: PropTypes.func.isRequired,
  onDragRelease: PropTypes.func.isRequired,
  layer: PropTypes.object.isRequired,
  children: PropTypes.object.isRequired,
  isBlockMoving: PropTypes.func.isRequired,
};

export default Block;
