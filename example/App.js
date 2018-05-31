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
  },
  lastItemContainer: {
    flex: 1,
    marginVertical: 10,
    marginHorizontal: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  wrapAdd: {
    width: 50,
    height: 50,
    backgroundColor: "green",
    marginVertical: 10,
    marginHorizontal: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  add: {
    fontWeight: "700",
    color: "white"
  },
  itemContainer: {
    flex: 1,
    marginVertical: 15,
    marginHorizontal: 15,
    borderRadius: 10
  },
  itemContent: {
    flex: 1
  },
  itemDesription: {
    flex: 1,
    backgroundColor: "grey",
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  descriptionText: {
    fontWeight: "700",
    color: "white"
  },
  deleteContainer: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    width: 20,
    height: 20,
    position: "absolute",
    right: -10,
    top: -10
  },
  delete: {
    fontWeight: "700",
    color: "white"
  }
});

const months = [
  { month: "January", color: "orange" },
  { month: "February", color: "yellow" },
  { month: "March", color: "blue" },
  { month: "April", color: "orange" },
  { month: "May", color: "yellow" },
  { month: "June", color: "blue" },
  { month: "July", color: "orange" },
  { month: "August", color: "yellow" },
  { month: "September", color: "blue" },
  { month: "October", color: "orange" },
  { month: "November", color: "yellow" },
  { month: "December", color: "blue" }
];

class App extends Component {
  constructor() {
    super();

    this.state = {
      activeBlock: null,
      itemsPerRow: 3,
      itemHeight: 150,
      data: [months[0]]
    };
  }

  // MARK: - Handle events

  onDragRelease(newData) {
    this.setState({ activeBlock: null, data: newData });
  }

  onDragGrant(index) {
    this.setState({ activeBlock: index });
  }

  // MARK: - Getters

  get dataByKey() {
    const { data } = this.state;

    return data.map(element => element.month);
  }

  // MARK: - Helper method

  addData() {
    const notAddedMonths = months.filter(
      month =>
        typeof this.state.data.find(item => item.month === month.month) ===
        "undefined"
    );
    if (notAddedMonths) {
      const newData = this.state.data.concat([notAddedMonths[0]]);
      this.setState({ data: newData });
    }
  }

  deleteElement(item) {
    const indexToRemove = this.dataByKey.indexOf(item.month);

    const newData = this.state.data.slice();
    newData.splice(indexToRemove, 1);

    this.setState({ data: newData });
  }

  // MARK: - Render elements

  renderItem(item) {
    const backgroundColor = item.color;

    return (
      <View
        style={[styles.itemContainer, { backgroundColor }]}
        key={item.month}
      >
        <TouchableOpacity
          style={styles.deleteContainer}
          onPress={index => this.deleteElement(item)}
        >
          <Text style={styles.delete}>-</Text>
        </TouchableOpacity>
        <View style={styles.itemContent} />
        <View style={styles.itemDesription}>
          <Text style={styles.descriptionText}>{item.month}</Text>
        </View>
      </View>
    );
  }

  renderLastItem() {
    return (
      <TouchableOpacity
        onPress={() => this.addData()}
        style={styles.lastItemContainer}
      >
        <View style={styles.wrapAdd}>
          <Text style={styles.add}>+</Text>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    const { data, activeBlock, itemHeight, itemsPerRow } = this.state;
    const lastItem =
      data.length === months.length ? undefined : this.renderLastItem();

    return (
      <View style={styles.container}>
        <Text style={styles.text}>{`The active block is: ${activeBlock}`}</Text>
        <DraggableGridView
          onDragRelease={newData => this.onDragRelease(newData)}
          onDragGrant={index => this.onDragGrant(index)}
          lastItem={lastItem}
          itemHeight={itemHeight}
          itemsPerRow={itemsPerRow}
          data={data}
          keyField="month"
          renderItem={item => this.renderItem(item)}
        />
        <Text>{JSON.stringify(this.dataByKey)}</Text>
      </View>
    );
  }
}

export default App;
