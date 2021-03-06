import React from 'react';

const noop = () => {};

/**
|--------------------------------------------------
| WithReducer
|--------------------------------------------------
*/

const withReducer = (reducer, initialState) => BaseComponent => {
  const factory = React.createFactory(BaseComponent);
  class WithReducer extends React.Component {
    constructor() {
      super();
      this.state = {
        stateValue: this.initializeStateValue()
      };
    }

    initializeStateValue() {
      if (initialState !== undefined) {
        return typeof initialState === 'function'
          ? initialState(this.props)
          : initialState;
      }
      return reducer(undefined, {type: '@@withReducer/INIT'});
    }

    dispatch(action, callback = noop) {
      this.setState(
        ({stateValue}) => ({
          stateValue: reducer(stateValue, action)
        }),
        () => callback(this.state.stateValue)
      );
    }

    render() {
      return factory({
        ...this.props,
        state: this.state.stateValue,
        dispatch: this.dispatch.bind(this)
      });
    }
  }

  return WithReducer;
};

/**
|--------------------------------------------------
| WithRematch
|--------------------------------------------------
*/

const createReducer = model => (state = model.state, action) => {
  const reducer = model.reducers[action.type];
  return reducer ? reducer(state, action.payload, action.props) : state;
};

const createActions = (model, dispatch, props) => {
  return Object.keys(model.reducers || []).reduce(
    (actions, type) => ({
      ...actions,
      [type]: payload => dispatch({type, payload, props})
    }),
    {}
  );
};

const createEffects = (model, dispatch, actions, state, props) => {
  if (!model.effects) return {};
  const effects = model.effects(actions);
  return Object.keys(effects || []).reduce(
    (actions, type) => ({
      ...actions,
      [type]: payload => {
        dispatch({type, payload});
        effects[type](payload, state, props);
      }
    }),
    {}
  );
};

const withRematch = model => WrappedComponent => {
  const factory = React.createFactory(WrappedComponent);
  const reducer = createReducer(model);
  return withReducer(reducer)(
    class WithRematch extends React.Component {
      componentWillMount() {
        const {dispatch, state, ...props} = this.props;
        const actions = createActions(model, dispatch, props);
        const effects = createEffects(model, dispatch, actions, state, props);
        this.actions = {...actions, ...effects};

        if (model.lifecycle && model.lifecycle.componentWillMount) {
          model.lifecycle.componentWillMount.call(this);
        }
      }

      componentDidMount() {
        if (model.lifecycle && model.lifecycle.componentDidMount) {
          model.lifecycle.componentDidMount.call(this);
        }
      }

      componentWillReceiveProps(...args) {
        if (model.lifecycle && model.lifecycle.componentWillReceiveProps) {
          model.lifecycle.componentWillReceiveProps.call(this, ...args);
        }
      }

      shouldComponentUpdate(...args) {
        if (model.lifecycle && model.lifecycle.shouldComponentUpdate) {
          return model.lifecycle.shouldComponentUpdate.call(this, ...args);
        }
        return true;
      }

      componentWillUpdate(...args) {
        if (model.lifecycle && model.lifecycle.componentWillUpdate) {
          return model.lifecycle.componentWillUpdate.call(this, ...args);
        }
      }

      componentDidUpdate(...args) {
        if (model.lifecycle && model.lifecycle.componentDidUpdate) {
          model.lifecycle.componentDidUpdate.call(this, ...args);
        }
      }

      componentWillUnmount(...args) {
        if (model.lifecycle && model.lifecycle.componentWillUnmount) {
          model.lifecycle.componentWillUnmount.call(this, ...args);
        }
      }

      render() {
        const {dispatch, state, ...props} = this.props;
        const actions = createActions(model, dispatch, props);
        const effects = createEffects(model, dispatch, actions, state, props);

        return factory({
          ...props,
          state: state,
          actions: this.actions
        });
      }
    }
  );
};

export default withRematch;
