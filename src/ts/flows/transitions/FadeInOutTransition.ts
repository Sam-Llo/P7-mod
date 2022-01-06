import { TransitionFlow } from "playa-core";
import { Container } from "pixi.js";
import { TweenMax } from "gsap";

/**
 * Generic fade transition
 */
class FadeInOutTransition extends TransitionFlow {
    async onExiting(containers: Container[]) {
        return Promise.all(
            containers.map((cont) => new Promise((r) => TweenMax.to(cont, 1, { alpha: 0, onComplete: () => r() }))),
        ).then(() => {});
    }

    async onEntering(containers: Container[]) {
        return Promise.all(
            containers.map((cont) => new Promise((r) => TweenMax.to(cont, 1, { alpha: 1, onComplete: () => r() }))),
        ).then(() => {});
    }
}
