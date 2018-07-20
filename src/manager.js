import Bird from './characters/bird';
import gameLoop from './base/gameLoop';
import eventAggregator from './base/eventAggregator';
import Events from './events';

var entities = {};
var isPatrolling = false;

var update = (delta) => {
    for(const targetId in entities){
        entities[targetId].update(delta);
    }
};

var render = () => {
    for(const targetId in entities){
        entities[targetId].draw();
    }
};

gameLoop.setUpdate(update).setDraw(render).start();

window.onbeforeunload = () => {
    gameLoop.stop();
};

eventAggregator.on(Events.bird.left, (targetId) => {
    entities[targetId] && remove(targetId);
    console.log(targetId + ' deleted');
});

var add = (targetId) => {
    entities[targetId] = new Bird(manager, 0, 0, targetId);
};

var remove = (targetId) => {
    entities[targetId] = null;
    delete entities[targetId];
};


var manager = {
    annoy: (targetId) => {
        entities[targetId] || add(targetId);
        entities[targetId].annoy();
    },
    sleep: (targetId) => {
        entities[targetId] || add(targetId);
        entities[targetId].sleep();
    },
    flyAwayWith: (targetId) => {
        entities[targetId] || add(targetId);
        entities[targetId].flyAwayWithTarget();
    },
    comeback: (targetId) => {
        entities[targetId] && entities[targetId].comeback();
    },
    leave: (targetId) => {
        entities[targetId] && entities[targetId].leave();
    },
    patrol: (enabled) => {
        if(isPatrolling == enabled) return;


    }
};

export default manager;


