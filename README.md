![Alt Text](https://media.giphy.com/media/8w9krdoqJaMQlWjvkr/giphy.gif)

# react-native-draggable-list

This is a React Native drag and drop project which is capable to have a fixed last element

## Usage

```
import DraggableList from 'react-native-draggable-list';

...

class App extends Component {
  constructor() {
    super();

    this.state = {
      activeBlock: null,
      itemsPerRow: 1,
      itemHeight: 150,
      data: [], // Your data goes here
    };
  }

  // MARK: - Handle events

  onDragRelease(newData) {
    this.setState({ activeBlock: null, data: newData });
  }

  onDragMove(newData) {
    this.setState({ data: newData });
  }

  onDragGrant(index) {
    this.setState({ activeBlock: index });
  }

  // MARK: - Render elements

  renderItem(item) {
    return (
      <View key={item.name}> // this key has to be the same as the keyField in the DraggableList
        ...
      </View>
    );
  }

  renderLastItem() {
    return (
      ...
    );
  }

  render() {
    const {
      data, activeBlock, itemHeight, itemsPerRow,
    } = this.state;
    const lastItem = data.length === ALL_DATA.length ? undefined : this.renderLastItem();

    return (
      ...
        <DraggableList
          onDragRelease={newData => this.onDragRelease(newData)}
          onDragMove={newData => this.onDragMove(newData)}
          onDragGrant={index => this.onDragGrant(index)}
          lastItem={() => this.renderLastItem()}
          itemHeight={itemHeight}
          itemsPerRow={itemsPerRow}
          data={data}
          keyField="name" // this key has to be the same has the item view in  renderItem
          renderItem={item => this.renderItem(item)}
        />
      ...
    );
  }
}
```

## SortableGrid properties

- `renderItem` **Function**
- `data` **Array**
- `keyField` **String**
- `onDragRelease` **Function**
- `onDragMove` **Function**
- `onDragGrant` **Function**
- `itemsPerRow` **Number**
- `itemHeight` **Number**
- `Object` **Number**
