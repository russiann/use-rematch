# use-rematch

🕶 A Hook that implement reducer a la Rematch

## Instalation

```
npm install -g use-rematch
or
yarn add use-rematch
```

## Usage

```js
import useRematch from 'use-rematch';

const model = {
  state: 0,
  reducers: {
    increment(state) {
      return state + 1;
    },
    decrement(state) {
      return state - 1;
    }
  },
  effects: actions => ({
    async asyncIncrement(payload, state) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      actions.increment();
    }
  })
};

function Counter(props) {
  const [state, actions] = useRematch(model, props);
  return (
    <div>
      Value: {state}
      <button onClick={actions.increment}>INCREMENT</Button>
      <button onClick={actions.decrement}>DENCREMENT</button>

      <button onClick={actions.asyncIncrement}>ASYNC INCREMENT</button>
    </div>
  );
}

```
