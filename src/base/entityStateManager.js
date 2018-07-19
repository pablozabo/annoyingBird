const StatePhase = {
    NotInitialized: 1,
    Initializing: 2,
    Active: 3,
    Finishing: 4,
    Finished: 5
};

class EntityStateManager {
    constructor()  {
        this.states = {};
        this.transitions = {};
        this.statePhase = StatePhase.NotInitialized;
        this.currentState = null;
        this.currentTransition = null;
    }

    addState(state) {
        this.states[state.name] = state;

        if(!this.currentState) {
            this.currentState = state;
        }
    }

    addTransition (transition) {
        let name = `${transition.from}_to_${transition.to}`;
        this.transitions[name] = transition;
    }

    getCurrentState () {
        return this.currentState;
    };

    getCurrentStateName = function(){
        return this.currentState.name;
    };

    getStateByName(name){
        return this.states[name];
    }

    setCurrentState (name){
        this.statePhase = StatePhase.NotInitialized;
        this.currentState =  this.states[name];
    }

    update () {
        let stateChanged = false;

        switch(this.statePhase){
            case StatePhase.NotInitialized:
                this.statePhase = StatePhase.Initializing;
                this.currentState.enter();
                this.statePhase = StatePhase.Active;
                stateChanged = true;

                break;
            case StatePhase.Active:
                this.currentTransition = null;
                let possibleTrasitions = this.getTransitionsByFromState(this.currentState.name);

                for(let i = 0; i < possibleTrasitions.length; i++){
                    if(possibleTrasitions[i].criteria()){
                        this.currentTransition = possibleTrasitions[i];
                        break;
                    }
                }

                if(this.currentTransition){
                    if(this.currentState.exit){
                        this.statePhase = StatePhase.Finishing;
                        this.currentState.exit().then(() => {
                            this.statePhase = StatePhase.NotInitialized;
                            this.currentState = this.states[this.currentTransition.to];
                        });
                    }else{
                        this.statePhase = StatePhase.NotInitialized;
                        this.currentState = this.states[this.currentTransition.to];
                    }
                }else{
                    this.currentState.update();
                }

                break;
        }

        return stateChanged;
    }

    getTransitionsByFromState (from) {
        let result = [];

        for(let key in this.transitions) {
            let transitionFrom = this.transitions[key].from instanceof Array ? this.transitions[key].from : [this.transitions[key].from];
            if(transitionFrom.indexOf(from) != -1){
                result.push(this.transitions[key]);
            }
        }

        return result;
    }

}

export {
    StatePhase,
    EntityStateManager
};