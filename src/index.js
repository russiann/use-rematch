import React from 'react';

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

function useRematch(model, props) {
  const reducer = createReducer(model);
  const [state, dispatch] = React.useReducer(reducer, model.state);

  const actions = createActions(model, dispatch, props);
  const effects = createEffects(model, dispatch, actions, state, props);

  return [state, {...actions, ...effects}];
}

export default useRematch;
