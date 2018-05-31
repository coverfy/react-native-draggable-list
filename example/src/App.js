import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  SafeAreaView
} from "react-native";
import DraggableGridView from "react-native-draggable-grid";

import { ALL_DATA } from "../assets/data/consoles.js";

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
    backgroundColor: "#4F9D69",
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  itemDesription: {
    flex: 0.3,
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
    backgroundColor: "#EF476F",
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
    fontWeight: "800",
    fontSize: 18,
    height: 25,
    color: "white"
  },
  image: {
    width: 50,
    height: 50
  }
});

class App extends Component {
  constructor() {
    super();

    this.state = {
      activeBlock: null,
      itemsPerRow: 3,
      itemHeight: 150,
      data: [ALL_DATA[0]]
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

    return data.map(element => element.name);
  }

  // MARK: - Helper method

  addData() {
    const notAddedData = ALL_DATA.filter(
      data =>
        typeof this.state.data.find(item => item.name === data.name) ===
        "undefined"
    );
    if (notAddedData) {
      const newData = this.state.data.concat([notAddedData[0]]);
      this.setState({ data: newData });
    }
  }

  deleteElement(item) {
    const indexToRemove = this.dataByKey.indexOf(item.name);

    const newData = this.state.data.slice();
    newData.splice(indexToRemove, 1);

    this.setState({ data: newData });
  }

  // MARK: - Render elements

  renderItem(item) {
    const backgroundColor = item.color;

    return (
      <View style={[styles.itemContainer, { backgroundColor }]} key={item.name}>
        <TouchableOpacity
          style={styles.deleteContainer}
          onPress={index => this.deleteElement(item)}
        >
          <Text style={styles.delete}>-</Text>
        </TouchableOpacity>
        <View style={styles.itemContent}>
          <Image
            style={styles.image}
            resizeMode="contain"
            source={item.image}
          />
        </View>
        <View style={styles.itemDesription}>
          <Text style={styles.descriptionText}>{item.name}</Text>
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
      data.length === ALL_DATA.length ? undefined : this.renderLastItem();

    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.text}>{`The active block is: ${activeBlock}`}</Text>
        <DraggableGridView
          onDragRelease={newData => this.onDragRelease(newData)}
          onDragGrant={index => this.onDragGrant(index)}
          lastItem={lastItem}
          itemHeight={itemHeight}
          itemsPerRow={itemsPerRow}
          data={data}
          keyField="name"
          renderItem={item => this.renderItem(item)}
        />
        <Text>{JSON.stringify(this.dataByKey)}</Text>
      </SafeAreaView>
    );
  }
}

export default App;
