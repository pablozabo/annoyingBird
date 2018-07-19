var callbackEvents = {};

export default class EventAggregator{

    static on (eventName, callback, context ){
        let ce =  callbackEvents[eventName] || (callbackEvents[eventName] = []);
        ce.push({ context: context, callback: callback });
    }

    static off (eventName, callback){
        let ce =  callbackEvents[eventName];

        if(!ce) return;

        for (let i = ce.length - 1; i >= 0; --i) {
            if (ce[i].callback === callback) {
                ce.splice(i, 1);
            }
        }

        if (ce.length === 0) {
            delete callbackEvents[eventName];
        }
    }

    static trigger (eventName, data){
        let ce =  callbackEvents[eventName];

        if(!ce) return;

        ce.forEach(event => {
            event.callback.call(event.context, data);
        })
    }

    static reset (eventName){
        if(eventName){
            delete callbackEvents[eventName];
        }else{
            callbackEvents = {};
        }
    }
}


