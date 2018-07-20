import {Sprite, Facing} from '../base/sprite'
import {dateDiffSeconds} from '../base/utils'
import eventAggregator from '../base/eventAggregator'
import events from '../events'

let name = 'bird';

var spritesheet = {
    width: 28,
    height: 28,
    image: 'url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAqAAAAAcCAMAAACJdf3QAAAAQlBMVEUAAAC7yrf+/f6eWkLp0H7ywoRXciWdekXayrYNDQ2urmOlg1A9LTQcHBwhISEAAACraFTmsVwAAAD/0zP/v2b/37MhqQe3AAAAFnRSTlMA////////////////////////////VIGNowAAA7NJREFUeJztmdvWqyAMhFkub/P+r7vrAQ2QGTRiu/Und+04nPKZWBtCjx49evTo0ePlIU7t6BU9elwKCcMwQE0EIzj5OqAPj98mUKqL+AAowyDjJ0ztE6Y2fTkZGcA9zoS3k0FNDtEn5KIvpHbFh27ww9kwjhhRQ1u+GiZAW672b4eQXubRptww334V1DzwsvvC0Jb5RbBvBdBE1Nb0lx3QRiGkl/m0tQGi/rhdwdZENIghx7oEVNaZoG/CDBFqaTucYN89fMF7WakJ9cXM4zEpoBfgPWeTpdIL9gkh1NASPukt5nuGebuPjHi2lwnzrYCSMd2AVuAdyFNFqc1DzcNBH6uERKs1eFLqaXJf4HPG2V4WIbG1RSVjLmWmOaBCAC012QAlvuY/IOPcxOnsHg/x+eg92cu2d4BAEz4mqqu76AN0HGRAoqFJDOK7CVBW6llyX+FLDof9okg+JbxUNdGEppoATcXKp7kyP7yh6ky1nU/iuwdQVupZch/rS44jTaAAMeNYMNWGtkGINCk0FQwIP7wf0MRWZwgNbQMU+NgeLmjTnUtKPXveeKgve17NjBlD24f9v7qyb1Y1FUe1PTCBfnhxKYRlcl9mrsneJopNtNDofVYk9wU+0RyV5VWfljo3xtId2rYHq09rLScw0bI2nSKRXKDq+SltldkuLmp5ya4l9+m+lIuyLOsT0/RSmG7Q4h5mPkH+LHi1ZsGr5ksOJtEEayHzZdsodnFds0p2lFhyn+rj7UonKS2v5DRv0ULcG86fCe+umfDqCfPz1CLSQu67aftKKsoPTuArfEosyBYd+YMDPs1btHr+bHi3rmJo2ZBw71gLhU/LbBd+zZfcx/pUmSx/ZqgkQY2f5imNjXkNewbvrqDzhFowfLcDikt2CcUbfLlkGwN4cMgPUrvOa2zMW/O+foRnBrRg+YJ//we1E1C8ybdKZjmIUvq3uYuzC3FD3jG7BzS2zGC/cL+koZJ9MLnnfcHpc64zgPm0VpK9vSs1AA3fjDvyXiGN/KsDtW028LRxQQMlG0NYjHkQwnU0YT4LwrhOpw+sc75CwYsAzV62fJnPO/Ie9aaARhnrXi3A/xkWk/UsEr8unVUf2COHN86F5qv4jpwLBlSX12+Xz2ItrTR2o/1vgFKbRdjuQbuno46uddIxW5wLBtQor1+O5nnnfHpB+g2gVDGvGCtmCiFAQZhzZNM1gfdlgE7v3FvPNccIE+jXuK2ieEbF0pX5mp9Lov0Y0MZ5//SwhsP9A82GjUKOnwdCAAAAAElFTkSuQmCC\')'
};

var animations = {
    'idle':        { frames: [0],                        frequency: 0,    repeat:  false},
    'blink':       { frames: [1, 0],                     frequency: 400,  repeat:  false},
    'look_around': { frames: [2, 0],                     frequency: 1200, repeat:  false},
    'hit':         { frames: [11, 12, 13, 12],           frequency: 20,   repeat:  false},
    'walk':        { frames: [3, 4, 5, 6, 7, 8, 9, 10],  frequency: 150,  repeat:  true},
    'scratch':     { frames: [18, 19, 20, 19],           frequency: 150,  repeat:  true},
    'fly':         { frames: [21, 22, 23, 22],           frequency: 60,   repeat:  true}
};

export default  class Bird extends Sprite {
    constructor(manager, x, y, targetId){
        super(manager, x, y, name, spritesheet);

        this.targetId = targetId;
        this.flyVelocity = 0.03;
        this.flyWithTargetVelocity = 0.01;
        this.walkVelocity = 0.04;
        this.annoying = false;
        this.rand = 0;
        this.hitCount = 0;
        this.nextState = null;
        this.originalTargePosition = this.getOriginalTarget().getBoundingClientRect();

        this.cursorInfo = {
            clicked: false,
            position: null
        };

        //region States

        this.stateManager.addState({
            name: 'idle',
            enter: () => {
                let target = this.getOriginalTarget();
                this.nextState = null
                target.style.position = 'relative';
                target.style.top = 0;
                target.style.left = 0;

                this.currentAnimation = animations['idle'];
                this.rand = parseInt(Math.random() * 5);
            },
            update: () => {
                this.adjustIdlePosition();
            }
        });

        this.stateManager.addState({
            name: 'blinking',
            enter: () => {
                this.currentAnimation = animations['blink'];
            },
            update: () => {
                this.adjustIdlePosition();
            }
        });

        this.stateManager.addState({
            name: 'looking',
            enter: () => {
                this.currentAnimation = animations['look_around'];
            },
            update: () => {
                this.adjustIdlePosition();
            }
        });

        this.stateManager.addState({
            name: 'scratching',
            enter: () => {
                this.currentAnimation = animations['scratch'];
            },
            update: () => {
                this.adjustIdlePosition();
            }
        });

        this.stateManager.addState({
            name: 'hitting',
            enter: () => {
                this.currentAnimation = animations['hit'];
                this.hitCount++;
            },
            update: () => {
                this.adjustIdlePosition();
            }
        });

        this.stateManager.addState({
            name: 'walking',
            enter: () => {
                this.currentAnimation = animations['walk'];
            },
            update: () => {
                this.setRelativePosition()
                this.adjustIdlePosition();
                this.setFacing();
            }
        });

        this.stateManager.addState({
            name: 'flying_to_target',
            enter: () => {
                this.currentAnimation = animations['fly'];

                if(!this.image.flyPosition){
                    let target = this.getTarget();
                    let xRand = Math.random() * window.innerWidth;
                    this.image.flyPosition = { y: -28, x: xRand, relativeTargetX:  0.9 - Math.random()};
                    this.image.relativePosition.x = target.clientWidth * (0.9 - Math.random());
                }
            },
            update: () => {
                this.setFlyFacing();
                this.flyToTarget();
            }
        });

        this.stateManager.addState({
            name: 'running_away',
            enter: () => {
                this.currentAnimation = animations['fly'];
                this.escapeTarget = {};
                this.escapeTarget = this.getEscapeTarget();
            },
            update: () => {
                if(this.cursorInfo.birdClicked){
                    this.escapeTarget = this.getEscapeTarget();
                }

                this.setFlyFacing();
                this.flyToTarget();
            }
        });

        this.stateManager.addState({
            name: 'leaving',
            enter: () => {
                this.currentAnimation = animations['fly'];
                this.escapeTarget = {};
                this.escapeTarget = this.getEscapeTarget(true);
            },
            update: () => {
                if(this.cursorInfo.birdClicked){
                    this.escapeTarget = this.getEscapeTarget(true);
                }

                this.setFlyFacing();
                this.flyToTarget();

                if(this.isOnTarget()){
                    this.destroy();
                    eventAggregator.trigger(events.bird.left, this.targetId);
                }
            }
        });

        this.stateManager.addState({
            name: 'running_away_with_target',
            enter: () => {
                this.currentAnimation = animations['fly'];
                this.escapeTarget = {};
                this.escapeTarget = this.getEscapeTarget(true);
            },
            update: () => {
                if(this.cursorInfo.birdClicked){
                    this.escapeTarget = this.getEscapeTarget(true);
                }

                this.setFlyFacing();
                this.flyToTarget(true);
            }
        });

        //endregion

        //region Trasitions

        this.stateManager.addTransition({
            from: 'idle',
            to: 'blinking',
            criteria: () => {
                var diff = dateDiffSeconds(this.stateStartedDate, new Date());
                return  (diff  >= 3 && this.rand == 0) || diff > 8;
            }
        });

        this.stateManager.addTransition({
            from: 'blinking',
            to: 'idle',
            criteria: () => {
                return  this.currentAnimationIndex == 1;
            }
        });

        this.stateManager.addTransition({
            from: 'idle',
            to: 'looking',
            criteria: () => {
                return dateDiffSeconds(this.stateStartedDate, new Date()) >= 5 && this.rand == 1;
            }
        });

        this.stateManager.addTransition({
            from: 'looking',
            to: 'idle',
            criteria: () => {
                return  this.currentAnimationIndex == 1;
            }
        });

        this.stateManager.addTransition({
            from: 'idle',
            to: 'scratching',
            criteria: () => {
                return dateDiffSeconds(this.stateStartedDate, new Date()) >= 4 && this.rand == 2;
            }
        });

        this.stateManager.addTransition({
            from: 'scratching',
            to: 'idle',
            criteria: () => {
                return  this.animationLoopCount > 1;
            }
        });

        this.stateManager.addTransition({
            from: ['idle', 'looking', 'blinking', 'walking' ],
            to: 'hitting',
            criteria: () => {
                return this.cursorInfo.clicked;
            }
        });

        this.stateManager.addTransition({
            from: 'hitting',
            to: 'idle',
            criteria: () => {
                return  this.currentAnimationIndex == 3;
            }
        });

        this.stateManager.addTransition({
            from: ['idle', 'looking', 'blinking' ],
            to: 'walking',
            criteria: () => {
                return this.isCursorOnTarget() ;
            }
        });

        this.stateManager.addTransition({
            from: 'walking',
            to: 'idle',
            criteria: () => {
                return !this.isCursorOnTarget();
            }
        });

        this.stateManager.addTransition({
            from: ['idle', 'flying_to_target'],
            to: 'running_away',
            criteria: () => {
                return this.cursorInfo.birdClicked;
            }
        });

        this.stateManager.addTransition({
            from: 'running_away',
            to: 'flying_to_target',
            criteria: () => {
                return this.isOnTarget();
            }
        });

        this.stateManager.addTransition({
            from: 'flying_to_target',
            to: 'idle',
            criteria: () => {
                return this.isOnTarget() && (!this.nextState || this.nextState == 'idle');
            }
        });

        this.stateManager.addTransition({
            from: 'flying_to_target',
            to: 'running_away_with_target',
            criteria: () => {
                return this.isOnTarget() && this.nextState == 'running_away_with_target';
            }
        });

        // this.stateManager.addTransition({
        //     from: 'hitting',
        //     to: 'running_away_with_target',
        //     criteria: () => {
        //         return  this.hitCount > 5;
        //     }
        // });

        this.stateManager.addTransition({
            from: 'running_away_with_target',
            to: 'idle',
            criteria: () => {
                return this.isOnTarget() && this.nextState == 'idle';
            }
        });

        //endregion

        //region Event handlers

        this.getTarget().addEventListener("click", (e) => {
            e.preventDefault();
            this.cursorInfo.clicked = true;
        });

        this.image.addEventListener("click", (e) => {
            e.preventDefault();
            this.cursorInfo.birdClicked = true;
        });

        document.addEventListener("mousemove", (e) => {
            this.cursorInfo.position = e;
        });

        //endregion
    }

    //region Private methods

    update (delta) {
        super.update(delta);
        this.clear();
    }

    getTarget() {
        return this.stateManager.getCurrentStateName() == 'running_away' ||
               this.stateManager.getCurrentStateName() == 'running_away_with_target' ||
        this.stateManager.getCurrentStateName() == 'leaving' ?
               this.escapeTarget : document.getElementById(this.targetId);
    };

    isCursorOnTarget () {
        if(!this.cursorInfo.position) return false;

        let target = this.getTarget();
        let rect = target.getBoundingClientRect();
        let distance = Math.abs(this.getDistance());

        return this.cursorInfo.position.x >= rect.left &&
            this.cursorInfo.position.x <= (rect.left + target.clientWidth) &&
            this.cursorInfo.position.y >= rect.top &&
            this.cursorInfo.position.y <= (rect.top + target.clientHeight ) &&
            distance > (spritesheet.width * 0.5);
    };

    getDistance() {
        let target = this.getTarget();
        let rect = target.getBoundingClientRect();
        let cursorRelativePosition = {};
        cursorRelativePosition.x = this.cursorInfo.position.x - rect.left;

        return cursorRelativePosition.x - this.image.relativePosition.x;
    };

    getFlyDistance() {
        let target = this.getTarget();
        let rect = target.getBoundingClientRect();
        let result = {};
        result.x = this.image.flyPosition.x - (rect.left + this.image.relativePosition.x - (spritesheet.width * 0.5));
        result.y = rect.top - (this.image.flyPosition.y) - spritesheet.width;

        return result;
    }

    setFacing(){
        if(!this.isCursorOnTarget()) return;
        let distance = this.getDistance();

        this.facing = distance > 0 ? Facing.Right : Facing.Left;
    };

    adjustIdlePosition(){
        let target = this.getTarget();
        let rect = target.getBoundingClientRect();

        this.image.style.top  = (rect.top - spritesheet.width)  + 'px';
        this.image.style.left = (rect.left + this.image.relativePosition.x - (spritesheet.width * 0.5))  + 'px';
    };

    setRelativePosition(){
        if(!this.isCursorOnTarget()) return;

        let distance = this.getDistance();
        let target = this.getTarget();
        let rect = target.getBoundingClientRect();
        this.image.relativePosition.x += distance * this.walkVelocity;
        this.image.flyPosition.x = (rect.left + this.image.relativePosition.x - (spritesheet.width * 0.5));
    };

    flyToTarget(carryTarget){
        let velocity = carryTarget ? this.flyWithTargetVelocity : this.flyVelocity;
        let target = this.getTarget();
        let rect = target.getBoundingClientRect();
        let distance = this.getFlyDistance();
        this.image.flyPosition.x += distance.x * velocity * -1;
        this.image.flyPosition.y += distance.y * velocity ;
     //   this.image.relativePosition.x = (this.image.flyPosition.x - rect.left + (spritesheet.width * 0.5));
        this.image.style.top  = (this.image.flyPosition.y )  + 'px';
        this.image.style.left = (this.image.flyPosition.x)  + 'px';

        if(carryTarget){
            let originalTarget = this.getOriginalTarget();
            let rect = originalTarget.getBoundingClientRect();
            originalTarget.style.position = 'fixed';
            originalTarget.style.top = (this.image.flyPosition.y + (spritesheet.height * 0.99) )  + 'px';
            originalTarget.style.left = this.image.flyPosition.x - this.image.relativePosition.x + (spritesheet.width * 0.5);
        }
    };

    setFlyFacing(){
        let distance = this.getFlyDistance();
        this.facing = distance.x > 0 ? Facing.Left : Facing.Right;
    };

    getOriginalTarget() {
        return document.getElementById(this.targetId);
    };

    isOnTarget(){
        if(!this.image.flyPosition) return false;

        let distance = this.getFlyDistance();
        return Math.abs(distance.x) < 10 && Math.abs(distance.y) < 10;
    }

    clear(){
        this.cursorInfo.clicked  = false;
        this.cursorInfo.birdClicked  = false;
    };

    getEscapeTarget(farAway){
        let target = this.getOriginalTarget();
        let xDirection =  Math.random() > 0.5 ? 1 : -1;
        let yDirection =  Math.random() > 0.5 ? 1 : -1;
        let currentX = this.escapeTarget.x || this.image.flyPosition.x;
        let currentY = this.escapeTarget.y || this.image.flyPosition.y;
        let xRand = Math.random() * window.innerWidth;

        return {
            getBoundingClientRect: () => { return {
                left: farAway ? xRand : currentX + (Math.random() * 50 * xDirection),
                top: farAway ? -28 - target.clientHeight  : currentY + (Math.random() * -10 * yDirection),
            }},
            clientWidth: target.clientWidth
        };
    };

    //endregion

    //region Public methods

    annoy () {
        if(!this.isOnTarget()){
            this.stateManager.setCurrentState('flying_to_target');
        }
    };

    sleep () {

    };

    flyAwayWithTarget () {

        if(this.isOnTarget()){
            this.stateManager.setCurrentState('running_away_with_target');
        }else
        {
            this.nextState = 'running_away_with_target';
            this.stateManager.setCurrentState('flying_to_target');
        }

    };

    comeback () {
        if(this.stateManager.getCurrentStateName() == 'running_away_with_target'){
            let target = this.getOriginalTarget();

            this.escapeTarget = {
                getBoundingClientRect: () => { return {
                    left: this.originalTargePosition.left,
                    top: this.originalTargePosition.top
                }},
                clientWidth: target.clientWidth
            };

            this.nextState = 'idle';
        }
    };

    leave () {
        if(this.stateManager.getCurrentStateName() != 'leaving'){
            this.stateManager.setCurrentState('leaving');
        }
    };

    //endregion

}