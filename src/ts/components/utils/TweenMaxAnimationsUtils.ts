import { Ease, TweenMax } from "gsap";

/**
 * TweenMaxAnimationsUtils
 */
export class TweenMaxAnimationsUtils {
    private static instance: TweenMaxAnimationsUtils;

    static getInstance(): TweenMaxAnimationsUtils {
        if (!TweenMaxAnimationsUtils.instance) {
            TweenMaxAnimationsUtils.instance = new TweenMaxAnimationsUtils();
        }

        return TweenMaxAnimationsUtils.instance;
    }

    public transitionScaleOutInElement(
        transitionElement,
        isIn,
        animationTimeForTransitionIn: number = 0.8,
        animationTimeForTransitionOut: number = 0.4,
        ease: Ease = new Ease(),
    ) {
        if (isIn) {
            transitionElement.scale.y = 1;
            TweenMax.fromTo(transitionElement.scale, animationTimeForTransitionIn / 2, { x: 0 }, { x: 1, ease });
            // TweenMax.fromTo(transitionElement, this.animationTimeForTransitionIn, {rotation: 0}, {rotation: 2 * Math.PI, ease: this.easeModeForTransitionIn});
            TweenMax.fromTo(transitionElement, animationTimeForTransitionIn, { alpha: 0 }, { alpha: 1, ease });
            // TweenMax.fromTo(transitionElement.scale, this.animationTimeForTransitionIn / 2, {x:1.5, y:1.5}, {x: 1, y :1, ease: this.easeModeForTransitionIn, delay:this.animationTimeForTransitionIn / 2});
        } else {
            TweenMax.fromTo(transitionElement.scale, animationTimeForTransitionOut, { y: 1 }, { y: 0, ease });
            // TweenMax.fromTo(transitionElement, this.animationTimeForTransitionOut, {rotation: 2 * Math.PI}, {rotation: 0, ease: this.easeModeForTransitionOut});
            TweenMax.fromTo(transitionElement, animationTimeForTransitionOut, { alpha: 1 }, { alpha: 0, ease });
        }
    }

    public transitionElement(
        transitionElement,
        isIn,
        animationTimeForTransitionIn: number = 0.8,
        animationTimeForTransitionOut: number = 0.4,
        ease: Ease = new Ease(),
    ) {
        if (isIn) {
            TweenMax.fromTo(
                transitionElement.scale,
                animationTimeForTransitionIn / 2,
                { x: 0, y: 0 },
                { x: 1, y: 1, ease },
            );
            TweenMax.fromTo(
                transitionElement,
                animationTimeForTransitionIn,
                { rotation: 0 },
                { rotation: 2 * Math.PI, ease },
            );
            TweenMax.fromTo(transitionElement, animationTimeForTransitionIn, { alpha: 0 }, { alpha: 1, ease });
            // TweenMax.fromTo(transitionElement.scale, this.animationTimeForTransitionIn / 2, {x:1.5, y:1.5}, {x: 1, y :1, ease: this.easeModeForTransitionIn, delay:this.animationTimeForTransitionIn / 2});
        } else {
            TweenMax.fromTo(
                transitionElement.scale,
                animationTimeForTransitionOut,
                { x: 1, y: 1 },
                { x: 0, y: 0, ease },
            );
            TweenMax.fromTo(
                transitionElement,
                animationTimeForTransitionOut,
                { rotation: 2 * Math.PI },
                { rotation: 0, ease },
            );
            TweenMax.fromTo(transitionElement, animationTimeForTransitionOut, { alpha: 1 }, { alpha: 0, ease });
        }
    }

    public transitionElementSpecial(
        transitionElement,
        isIn,
        animationTimeForTransitionIn: number = 0.8,
        animationTimeForTransitionOut: number = 0.4,
        delay,
        ease: Ease = new Ease(),
    ) {
        if (isIn) {
            TweenMax.fromTo(
                transitionElement.scale,
                (animationTimeForTransitionIn - delay) / 2,
                { x: 0, y: 0 },
                { x: 2, y: 1, ease, delay },
            );
            TweenMax.fromTo(
                transitionElement,
                animationTimeForTransitionIn - delay,
                { alpha: 0 },
                { alpha: 1, ease, delay },
            );
            TweenMax.fromTo(
                transitionElement.scale,
                (animationTimeForTransitionIn - delay) / 2,
                { x: 2, y: 1 },
                { x: 1, y: 1, ease, delay: delay + (animationTimeForTransitionIn - delay) / 2 },
            );
        } else {
            TweenMax.fromTo(
                transitionElement.scale,
                animationTimeForTransitionOut,
                { x: 1, y: 1 },
                { x: 0, y: 0, ease },
            );
            TweenMax.fromTo(transitionElement, animationTimeForTransitionOut, { alpha: 1 }, { alpha: 0, ease });
        }
    }

    public transitionElementSpecialSpecial(
        transitionElement,
        isIn,
        animationTimeForTransitionIn: number = 0.8,
        animationTimeForTransitionOut: number = 0.4,
        delay,
        ease: Ease = new Ease(),
    ) {
        if (isIn) {
            TweenMax.fromTo(
                transitionElement.scale,
                (animationTimeForTransitionIn - delay) / 2,
                { x: 0, y: 0 },
                { x: 2, y: 1, ease, delay },
            );
            TweenMax.fromTo(
                transitionElement,
                animationTimeForTransitionIn - delay,
                { alpha: 0 },
                { alpha: 1, ease, delay },
            );
            TweenMax.fromTo(
                transitionElement.scale,
                (animationTimeForTransitionIn - delay) / 2,
                { x: 2, y: 1 },
                { x: 1, y: 1, ease, delay: delay + (animationTimeForTransitionIn - delay) / 2 },
            );
        } else {
            TweenMax.fromTo(
                transitionElement.scale,
                animationTimeForTransitionOut,
                { x: 1, y: 1 },
                { x: 0, y: 0, ease },
            );
            TweenMax.fromTo(transitionElement, animationTimeForTransitionOut, { alpha: 1 }, { alpha: 0, ease });
        }
    }
}
