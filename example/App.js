import React, { Component } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import DraggableGridView from "react-native-draggable-grid";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  text: {
    marginTop: 30
  }
});

class App extends Component {
  constructor() {
    super();

    this.state = {
      elementsToShow: 3,
      activeBlock: null,
      itemsPerRow: 5,
      itemHeight: 150,
      data: [
        { month: "January", color: "red" },
        { month: "February", color: "green" },
        { month: "March", color: "blue" },
        { month: "April", color: "red" },
        { month: "May", color: "green" },
        { month: "June", color: "blue" },
        { month: "July", color: "red" },
        { month: "August", color: "green" },
        { month: "September", color: "blue" },
        { month: "October", color: "red" },
        { month: "November", color: "green" },
        { month: "December", color: "blue" }
      ]
    };
  }

  // MARK: - Handle events

  onDragRelease(newOrder) {
    this.reOrderDocuments(newOrder);
    this.setState({ activeBlock: null });
  }

  onDragGrant(index) {
    this.setState({ activeBlock: index });
  }

  // MARK: - Getters

  get dataToRender() {
    const { data, elementsToShow } = this.state;

    return data
      .slice(0, elementsToShow)
      .map((item, index) => this.renderItem(item, index));
  }

  // MARK: - Helper methods

  reOrderDocuments() {}

  // MARK: - Render elements

  renderItem(item) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: item.color,
          marginVertical: 5,
          marginHorizontal: 5,
          borderRadius: 10
        }}
        key={item.month}
      >
        <View style={{ flex: 1 }} />
        <View
          style={{
            flex: 1,
            backgroundColor: "grey",
            borderBottomRightRadius: 10,
            borderBottomLeftRadius: 10,
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Text style={{ fontWeight: "700", color: "white" }}>
            {item.month}
          </Text>
        </View>
      </View>
    );
  }

  renderLastItem() {
    return (
      <TouchableOpacity
        onPress={() =>
          this.setState({ elementsToShow: this.state.elementsToShow + 1 })
        }
        style={{
          flex: 1,
          marginVertical: 10,
          marginHorizontal: 10,
          borderRadius: 10,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <View style={{ backgroundColor: "red", borderRadius: 10 }}>
          <Text
            style={{
              padding: 10,
              fontWeight: "700",
              color: "white",
              fontSize: 20
            }}
          >
            +
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    const { activeBlock, itemHeight, itemsPerRow } = this.state;

    return (
      <View style={styles.container}>
        <Text style={styles.text}>{`The active block is: ${activeBlock}`}</Text>
        <DraggableGridView
          onDragRelease={newOrder => this.onDragRelease(newOrder)}
          onDragGrant={index => this.onDragGrant(index)}
          lastItem={this.renderLastItem()}
          itemHeight={itemHeight}
          itemsPerRow={itemsPerRow}
          data={this.dataToRender}
        />
      </View>
    );
  }
}

export default App;
