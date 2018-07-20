import { EntityStateManager } from './entityStateManager';

const Facing = {
    Left: 1,
    Right: 2
};

var count = 0;

class Sprite  {
    constructor(manager, x , y, name, spritesheet){
        this.id = ++count;
        this.manager = manager;
        this.name = name;
        this.spritesheet = spritesheet;
        this.stateManager = new EntityStateManager();

        this.spriteElapsedTime = 0;
        this.currentAnimation = null;
        this.currentAnimationIndex = 0;
        this.stateStartedDate = new Date();
        this.animationCount = 0;
        this.animationLoopCount = 0;
        this.facing = Facing.Right;

        this.image = document.createElement('div');
        this.image.style.width = this.spritesheet.width + 'px';
        this.image.style.height = this.spritesheet.height + 'px';
        this.image.style.position = 'absolute';
        this.image.style.left = x + 'px';
        this.image.style.top = y + 'px';
        this.image.style.background = this.spritesheet.image;
        this.image.relativePosition = {x: this.spritesheet.width * 0.5 , y: 0};
        document.body.appendChild(this.image);
    }

    update (delta) {
        if(!this.image) return;

        var stateChanged = this.stateManager.update(delta);
        this.setAnimationIndex(delta);

        if(stateChanged){
            this.animationCount = 0;
            this.currentAnimationIndex = 0;
            this.animationLoopCount = 0;
            this.animationCount++;
            this.stateStartedDate = new Date();
        }
    }

    draw () {
        if(!this.currentAnimation) return;

        let framePercent = 4.346;
        this.image.style['background-position-x'] = (this.currentAnimation.frames[this.currentAnimationIndex] * framePercent) + '%'
        this.image.style['transform'] = this.facing == Facing.Right ? 'scaleX(1)' : 'scaleX(-1)';
    }

    setAnimationIndex (delta) {
        if(!this.currentAnimation) return;

        this.spriteElapsedTime += delta;

        if(this.spriteElapsedTime < this.currentAnimation.frequency) return;

        this.spriteElapsedTime = 0;

        if(this.currentAnimation.repeat){
            if(this.currentAnimationIndex == (this.currentAnimation.frames.length - 1)) this.animationLoopCount++;

            this.currentAnimationIndex = (++this.currentAnimationIndex) % this.currentAnimation.frames.length;
        }else if(this.currentAnimationIndex < (this.currentAnimation.frames.length -1) ){
            this.currentAnimationIndex++;
        }
    };

    destroy () {
        this.currentAnimation = null;
        this.image.parentNode.removeChild(this.image);
        this.image = null;
    }
}

export {
    Facing,
    Sprite
};