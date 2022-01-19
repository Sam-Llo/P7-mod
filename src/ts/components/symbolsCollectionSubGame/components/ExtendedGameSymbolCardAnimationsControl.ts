import { TweenMax } from "gsap";
import { soundManager, SpineAnimation } from "playa-core";
import { gameStore } from "../..";
import { ExtendedGameSymbolCard } from "./ExtendedGameSymbolCard";

/**
 * ExtendedGameSymbolCardAnimationsControl
 */
export class ExtendedGameSymbolCardAnimationsControl {
    private _coverAnim!: SpineAnimation;

    private _frameCoverAnim!: SpineAnimation;

    private _winGlowAnim!: SpineAnimation;

    private _matchAnim!: SpineAnimation;

    private _drinkAnimationDelayResolve;

    private _drinkGlowShakingMaxTurns;

    private _drinkGlowShakingTurns;

    private _gameSymbolsConfig;

    private _symbolMatchOutroAnimation;

    private static readonly matchAnimationOutroAnimationSpeed: number = 2;

    private _coverFoilAnimationMap!: {
        UNREVEALED: {
            IDLE: string;
            STATIC: string;
            MOUSEOVER: string;
            MOUSEOUT: string;
            REVEAL: string;
            RESET: string;
            MOUSEOVERFRAME: string;
            MOUSEOUTFRAME: string;
            IDLEFRAME: string;
            REVEALFRAME: string;
            RESETFRAME: string;
        };
        WINREVEAL: {
            STATIC: string;
            REVEAL: string;
            OUTRO: string;
        };
        LOSEREVEAL: {
            STATIC: string;
            REVEAL: string;
            OUTRO: string;
        };
    };

    private _matchAnimationMap!: {
        WINNING_GAME_SYMBOLS: {
            PALM_TREE: {
                SINGLE: {
                    REVEAL: string;
                    OUTRO: string;
                    STATIC: string;
                };
                DOUBLE: {
                    REVEAL: string;
                    OUTRO: string;
                    STATIC: string;
                };
                TRIPLE: {
                    REVEAL: string;
                    OUTRO: string;
                    STATIC: string;
                };
            };
            SUN: {
                SINGLE: {
                    REVEAL: string;
                    OUTRO: string;
                    STATIC: string;
                };
                DOUBLE: {
                    REVEAL: string;
                    OUTRO: string;
                    STATIC: string;
                };
                TRIPLE: {
                    REVEAL: string;
                    OUTRO: string;
                    STATIC: string;
                };
            };
            ICECREAM: {
                SINGLE: {
                    REVEAL: string;
                    OUTRO: string;
                    STATIC: string;
                };
                DOUBLE: {
                    REVEAL: string;
                    OUTRO: string;
                    STATIC: string;
                };
                TRIPLE: {
                    REVEAL: string;
                    OUTRO: string;
                    STATIC: string;
                };
            };
            STARFISH: {
                SINGLE: {
                    REVEAL: string;
                    OUTRO: string;
                    STATIC: string;
                };
                DOUBLE: {
                    REVEAL: string;
                    OUTRO: string;
                    STATIC: string;
                };
                TRIPLE: {
                    REVEAL: string;
                    OUTRO: string;
                    STATIC: string;
                };
            };
        };
        LOSING_GAME_SYMBOLS: {
            FLOWER: {
                REVEAL: string;
                OUTRO: string;
                STATIC: string;
            };
            SUNGLASS: {
                REVEAL: string;
                OUTRO: string;
                STATIC: string;
            };
            WATERMELON: {
                REVEAL: string;
                OUTRO: string;
                STATIC: string;
            };
            ICE_LOLLY: {
                REVEAL: string;
                OUTRO: string;
                STATIC: string;
            };
            SURFBOARD: {
                REVEAL: string;
                OUTRO: string;
                STATIC: string;
            };
            CONCH: {
                REVEAL: string;
                OUTRO: string;
                STATIC: string;
            };
        };
    };

    private _bonusGameSymbols!: {
        InstantWin: {
            STATIC: string;
            REVEAL: string;
            OUTRO: string;
        };
        LockAndReelBonusSymbol: {
            STATIC: string;
            REVEAL: string;
            OUTRO: string;
            GLOW_SHAKE: string;
            NO_GLOW_SHAKE: string;
        };
    };

    private _gameSymbolCard: ExtendedGameSymbolCard;

    constructor(gameSymbolCard, gameSymbolsConfig, coverAnim, frameCoverAnim, winGlowAnim, matchAnim) {
        this._gameSymbolCard = gameSymbolCard;

        this._gameSymbolsConfig = gameSymbolsConfig;

        this._coverAnim = coverAnim;

        this._frameCoverAnim = frameCoverAnim;

        // Set renderable
        this._coverAnim.renderable = true;
        this._frameCoverAnim.renderable = true;

        this._winGlowAnim = winGlowAnim;
        this._winGlowAnim.renderable = false;
        this._winGlowAnim.spine.state.addListener({
            complete: (entry) => {
                this._winGlowAnim.renderable = false;
            },
        });

        this._matchAnim = matchAnim;
        // Match anim never renderable by default
        this._matchAnim.renderable = false;

        this._symbolMatchOutroAnimation = "";
        // Find the animations
        this._coverFoilAnimationMap = {
            UNREVEALED: {
                IDLE: this._gameSymbolsConfig.FoilAnimations.Unrevealed.Idle,
                STATIC: this._gameSymbolsConfig.FoilAnimations.Unrevealed.Static,
                MOUSEOVER: this._gameSymbolsConfig.FoilAnimations.Unrevealed.Mouseover,
                MOUSEOUT: this._gameSymbolsConfig.FoilAnimations.Unrevealed.Mouseout,
                REVEAL: this._gameSymbolsConfig.FoilAnimations.Unrevealed.Reveal,
                RESET: this._gameSymbolsConfig.FoilAnimations.Unrevealed.Reset,
                MOUSEOVERFRAME: this._gameSymbolsConfig.FoilAnimations.Unrevealed.Mouseoverframe,
                MOUSEOUTFRAME: this._gameSymbolsConfig.FoilAnimations.Unrevealed.Mouseoutframe,
                IDLEFRAME: this._gameSymbolsConfig.FoilAnimations.Unrevealed.Idleframe,
                REVEALFRAME: this._gameSymbolsConfig.FoilAnimations.Unrevealed.Revealframe,
                RESETFRAME: this._gameSymbolsConfig.FoilAnimations.Unrevealed.Resetframe,
            },
            WINREVEAL: {
                STATIC: this._gameSymbolsConfig.FoilAnimations.WinReveal.Static,
                REVEAL: this._gameSymbolsConfig.FoilAnimations.WinReveal.Reveal,
                OUTRO: this._gameSymbolsConfig.FoilAnimations.WinReveal.Outro,
            },
            LOSEREVEAL: {
                STATIC: this._gameSymbolsConfig.FoilAnimations.LoseReveal.Static,
                REVEAL: this._gameSymbolsConfig.FoilAnimations.LoseReveal.Reveal,
                OUTRO: this._gameSymbolsConfig.FoilAnimations.LoseReveal.Outro,
            },
        };

        // Find the match animations
        this._matchAnimationMap = {
            WINNING_GAME_SYMBOLS: {
                PALM_TREE: {
                    SINGLE: {
                        REVEAL: this._gameSymbolsConfig.WinningGameSymbols.PalmTree.Single.Reveal,
                        OUTRO: this._gameSymbolsConfig.WinningGameSymbols.PalmTree.Single.Outro,
                        STATIC: this._gameSymbolsConfig.WinningGameSymbols.PalmTree.Single.Static,
                    },
                    DOUBLE: {
                        REVEAL: this._gameSymbolsConfig.WinningGameSymbols.PalmTree.Double.Reveal,
                        OUTRO: this._gameSymbolsConfig.WinningGameSymbols.PalmTree.Double.Outro,
                        STATIC: this._gameSymbolsConfig.WinningGameSymbols.PalmTree.Double.Static,
                    },
                    TRIPLE: {
                        REVEAL: this._gameSymbolsConfig.WinningGameSymbols.PalmTree.Triple.Reveal,
                        OUTRO: this._gameSymbolsConfig.WinningGameSymbols.PalmTree.Triple.Outro,
                        STATIC: this._gameSymbolsConfig.WinningGameSymbols.PalmTree.Triple.Static,
                    },
                },
                SUN: {
                    SINGLE: {
                        REVEAL: this._gameSymbolsConfig.WinningGameSymbols.Sun.Single.Reveal,
                        OUTRO: this._gameSymbolsConfig.WinningGameSymbols.Sun.Single.Outro,
                        STATIC: this._gameSymbolsConfig.WinningGameSymbols.Sun.Single.Static,
                    },
                    DOUBLE: {
                        REVEAL: this._gameSymbolsConfig.WinningGameSymbols.Sun.Double.Reveal,
                        OUTRO: this._gameSymbolsConfig.WinningGameSymbols.Sun.Double.Outro,
                        STATIC: this._gameSymbolsConfig.WinningGameSymbols.Sun.Double.Static,
                    },
                    TRIPLE: {
                        REVEAL: this._gameSymbolsConfig.WinningGameSymbols.Sun.Triple.Reveal,
                        OUTRO: this._gameSymbolsConfig.WinningGameSymbols.Sun.Triple.Outro,
                        STATIC: this._gameSymbolsConfig.WinningGameSymbols.Sun.Triple.Static,
                    },
                },
                ICECREAM: {
                    SINGLE: {
                        REVEAL: this._gameSymbolsConfig.WinningGameSymbols.Icecream.Single.Reveal,
                        OUTRO: this._gameSymbolsConfig.WinningGameSymbols.Icecream.Single.Outro,
                        STATIC: this._gameSymbolsConfig.WinningGameSymbols.Icecream.Single.Static,
                    },
                    DOUBLE: {
                        REVEAL: this._gameSymbolsConfig.WinningGameSymbols.Icecream.Double.Reveal,
                        OUTRO: this._gameSymbolsConfig.WinningGameSymbols.Icecream.Double.Outro,
                        STATIC: this._gameSymbolsConfig.WinningGameSymbols.Icecream.Double.Static,
                    },
                    TRIPLE: {
                        REVEAL: this._gameSymbolsConfig.WinningGameSymbols.Icecream.Triple.Reveal,
                        OUTRO: this._gameSymbolsConfig.WinningGameSymbols.Icecream.Triple.Outro,
                        STATIC: this._gameSymbolsConfig.WinningGameSymbols.Icecream.Triple.Static,
                    },
                },
                STARFISH: {
                    SINGLE: {
                        REVEAL: this._gameSymbolsConfig.WinningGameSymbols.StarFish.Single.Reveal,
                        OUTRO: this._gameSymbolsConfig.WinningGameSymbols.StarFish.Single.Outro,
                        STATIC: this._gameSymbolsConfig.WinningGameSymbols.StarFish.Single.Static,
                    },
                    DOUBLE: {
                        REVEAL: this._gameSymbolsConfig.WinningGameSymbols.StarFish.Double.Reveal,
                        OUTRO: this._gameSymbolsConfig.WinningGameSymbols.StarFish.Double.Outro,
                        STATIC: this._gameSymbolsConfig.WinningGameSymbols.StarFish.Double.Static,
                    },
                    TRIPLE: {
                        REVEAL: this._gameSymbolsConfig.WinningGameSymbols.StarFish.Triple.Reveal,
                        OUTRO: this._gameSymbolsConfig.WinningGameSymbols.StarFish.Triple.Outro,
                        STATIC: this._gameSymbolsConfig.WinningGameSymbols.StarFish.Triple.Static,
                    },
                },
            },
            LOSING_GAME_SYMBOLS: {
                FLOWER: {
                    REVEAL: this._gameSymbolsConfig.LosingGameSymbols.Flower.Reveal,
                    OUTRO: this._gameSymbolsConfig.LosingGameSymbols.Flower.Outro,
                    STATIC: this._gameSymbolsConfig.LosingGameSymbols.Flower.Static,
                },
                SUNGLASS: {
                    REVEAL: this._gameSymbolsConfig.LosingGameSymbols.SunGlass.Reveal,
                    OUTRO: this._gameSymbolsConfig.LosingGameSymbols.SunGlass.Outro,
                    STATIC: this._gameSymbolsConfig.LosingGameSymbols.SunGlass.Static,
                },
                WATERMELON: {
                    REVEAL: this._gameSymbolsConfig.LosingGameSymbols.Watermelon.Reveal,
                    OUTRO: this._gameSymbolsConfig.LosingGameSymbols.Watermelon.Outro,
                    STATIC: this._gameSymbolsConfig.LosingGameSymbols.Watermelon.Static,
                },
                ICE_LOLLY: {
                    REVEAL: this._gameSymbolsConfig.LosingGameSymbols.IceLolly.Reveal,
                    OUTRO: this._gameSymbolsConfig.LosingGameSymbols.IceLolly.Outro,
                    STATIC: this._gameSymbolsConfig.LosingGameSymbols.IceLolly.Static,
                },
                SURFBOARD: {
                    REVEAL: this._gameSymbolsConfig.LosingGameSymbols.Surfboard.Reveal,
                    OUTRO: this._gameSymbolsConfig.LosingGameSymbols.Surfboard.Outro,
                    STATIC: this._gameSymbolsConfig.LosingGameSymbols.Surfboard.Static,
                },
                CONCH: {
                    REVEAL: this._gameSymbolsConfig.LosingGameSymbols.Conch.Reveal,
                    OUTRO: this._gameSymbolsConfig.LosingGameSymbols.Conch.Outro,
                    STATIC: this._gameSymbolsConfig.LosingGameSymbols.Conch.Static,
                },
            },
        };

        // Find the symbol animations
        this._bonusGameSymbols = {
            InstantWin: {
                STATIC: this._gameSymbolsConfig.BonusGameSymbols.Chest.Static,
                REVEAL: this._gameSymbolsConfig.BonusGameSymbols.Chest.Reveal,
                OUTRO: this._gameSymbolsConfig.BonusGameSymbols.Chest.Outro,
            },
            LockAndReelBonusSymbol: {
                STATIC: this._gameSymbolsConfig.BonusGameSymbols.CocktailGlass.Static,
                REVEAL: this._gameSymbolsConfig.BonusGameSymbols.CocktailGlass.Reveal,
                OUTRO: this._gameSymbolsConfig.BonusGameSymbols.CocktailGlass.Outro,
                GLOW_SHAKE: this._gameSymbolsConfig.BonusGameSymbols.CocktailGlass.GlowShake,
                NO_GLOW_SHAKE: this._gameSymbolsConfig.BonusGameSymbols.CocktailGlass.NoGlowShake,
            },
        };
    }

    public reset(iswin: boolean): void {
        this._coverAnim.renderable = true;
        if (this._symbolMatchOutroAnimation !== "") {
            this._matchAnim.animationSpeed = ExtendedGameSymbolCardAnimationsControl.matchAnimationOutroAnimationSpeed;
            this._matchAnim.setAnimation(this._symbolMatchOutroAnimation);
            this._matchAnim.play();
            this.removeSpineListeners(this._matchAnim);
            this._matchAnim.spine.state.addListener({
                complete: (entry) => {
                    this._matchAnim.animationSpeed = 1;
                    this._matchAnim.renderable = false;
                    this._symbolMatchOutroAnimation = "";
                    if (iswin) {
                        this._coverAnim.setAnimation(this._coverFoilAnimationMap.WINREVEAL.OUTRO);
                    } else {
                        this._coverAnim.setAnimation(this._coverFoilAnimationMap.LOSEREVEAL.OUTRO);
                    }
                    //onComplte set to reset
                    this._frameCoverAnim.addAnimation(this._coverFoilAnimationMap.UNREVEALED.RESETFRAME);
                    this._frameCoverAnim.play();

                    // this._coverAnim.addAnimation(this._coverFoilAnimationMap.UNREVEALED.RESET);
                    //this._coverAnim.play();
                },
            });
        } else {
            this._coverAnim.setAnimation(this._coverFoilAnimationMap.UNREVEALED.STATIC);
            this._coverAnim.play();
        }
    }

    /**
     * setMatchAnimRenderable
     * @param renderable
     */
    public setMatchAnimRenderable(renderable: boolean) {
        this._matchAnim.renderable = renderable;
    }

    public async playUncoverAnimation(): Promise<void> {
        await new Promise<void>((resolve) => {
            if (this._gameSymbolCard.isSpecialCase()) {
                this._coverAnim.setAnimation(this._coverFoilAnimationMap.WINREVEAL.REVEAL);
            } else {
                this._coverAnim.setAnimation(this._coverFoilAnimationMap.LOSEREVEAL.REVEAL);
            }

            // Remove listeners
            this.removeSpineListeners(this._coverAnim);

            TweenMax.delayedCall(0.05, () => {
                //Note: We cannot do reset idle here, because chest pop up will pause the game flow in manualy play
                // this._parent.sgActions.resetIdle();
                // this._coverAnim.renderable = false;
                this._matchAnim.renderable = true;
                this.setMatchAnimAnimationToPlayAndOutroAnimationBaseOnCurrentSymbol();
                if (this._gameSymbolCard.isSpecialCase() === false) {
                    //Resolve/unpause the game only when reveal animation finished playing.
                    resolve();
                } else if (this._gameSymbolCard.isWinningSymbol()) {
                    resolve(); //Winning Symbols resolve immeately, might need to change this
                }
            });

            this.removeSpineListeners(this._matchAnim);
            this._matchAnim.spine.state.addListener({
                start: (entry) => {
                    if (entry.animation.name === this._bonusGameSymbols.InstantWin.REVEAL) {
                        if (gameStore.props.revealAllEnabled === false) {
                            soundManager.execute("onBonusTileReveal");
                        }
                    } else if (entry.animation.name === this._bonusGameSymbols.LockAndReelBonusSymbol.REVEAL) {
                        if (gameStore.props.revealAllEnabled === false) {
                            soundManager.execute("onBonusTileReveal2");
                        }
                    }

                    if (entry.animation.name === this._bonusGameSymbols.LockAndReelBonusSymbol.GLOW_SHAKE) {
                        soundManager.execute("onBonusDrinkShake");
                        if (this._drinkGlowShakingTurns >= this._drinkGlowShakingMaxTurns - 1) {
                            TweenMax.delayedCall(
                                entry.animation.duration *
                                    this._gameSymbolsConfig.DrinkShakeAnimationPercantageBeforeWaveComesUp,
                                () => {
                                    this._drinkGlowShakingTurns = 0;
                                    this._drinkAnimationDelayResolve();
                                    this._drinkAnimationDelayResolve = undefined;
                                },
                            );
                        }
                    }
                },
                complete: (entry) => {
                    if (entry.animation.name === this._bonusGameSymbols.LockAndReelBonusSymbol.GLOW_SHAKE) {
                        if (this._drinkAnimationDelayResolve) {
                            this._drinkGlowShakingTurns++;
                            if (this._drinkGlowShakingTurns < this._drinkGlowShakingMaxTurns) {
                                this._matchAnim.setAnimation(
                                    this._bonusGameSymbols.LockAndReelBonusSymbol.GLOW_SHAKE,
                                    undefined,
                                    false,
                                );
                                this._matchAnim.play();
                            }
                        } else {
                            this._matchAnim.setAnimation(
                                this._bonusGameSymbols.LockAndReelBonusSymbol.NO_GLOW_SHAKE,
                                undefined,
                                false,
                            );
                            this._matchAnim.play();
                        }
                    }
                    if (
                        entry.animation.name === this._bonusGameSymbols.InstantWin.REVEAL ||
                        entry.animation.name === this._bonusGameSymbols.LockAndReelBonusSymbol.REVEAL
                    ) {
                        //Bonus game symbol or instant win symbols will need to wait till its current animation finished play
                        resolve();
                    }
                },
            });

            this._frameCoverAnim.setAnimation(this._coverFoilAnimationMap.UNREVEALED.REVEALFRAME);
            TweenMax.killTweensOf(this._frameCoverAnim.scale);
            this._frameCoverAnim.scale.set(1, 1);
            // Play frame reveal anim
            this._frameCoverAnim.play();

            // Set scale to 1 because roll over scale this sprite/spine bigger
            TweenMax.killTweensOf(this._coverAnim.scale);
            this._coverAnim.scale.set(1, 1);
            // Play reveal anim
            this._coverAnim.play();
        });
    }

    public playRolloverAnimation(): void {
        this._coverAnim.setAnimation(this._coverFoilAnimationMap.UNREVEALED.MOUSEOVER, undefined, true);
        this._coverAnim.play();

        this._frameCoverAnim.setAnimation(this._coverFoilAnimationMap.UNREVEALED.MOUSEOVERFRAME, undefined, true);
        this._frameCoverAnim.play();
        // Scale the anim up
        TweenMax.to(this._coverAnim.scale, 1 / 3, { x: 1.15, y: 1.15 });
        TweenMax.to(this._frameCoverAnim.scale, 1 / 3, { x: 1.15, y: 1.15 });
    }

    public playRolloutAnimation(): void {
        // Only trigger a mouseout if we're in rollover
        // When re-enabling a number having revealed manually, the mouseout event that would have been
        // fired is fired as soon as enabled, which causes the spine animation to briefly show the mouseout animation
        // Hence, we should only proceed with showing the mouseout animation if we're already in a mouseover state
        if (
            this._coverAnim.spine.state.getCurrent(0).animation.name !==
            this._coverFoilAnimationMap.UNREVEALED.MOUSEOVER
        ) {
            return;
        }

        // Carry on as normal
        this._coverAnim.setAnimation(this._coverFoilAnimationMap.UNREVEALED.MOUSEOUT); //TODO: do not have mouse out animation
        this.removeSpineListeners(this._coverAnim);

        this._frameCoverAnim.setAnimation(this._coverFoilAnimationMap.UNREVEALED.MOUSEOUTFRAME);
        this.removeSpineListeners(this._frameCoverAnim);

        // this._coverAnim.spine.state.addListener({
        //complete: (entry) => {
        //If mouse out animation finished playing, we set the cover animation to static
        // if (entry.animation.name === this._coverFoilAnimationMap.UNREVEALED.MOUSEOUT) {
        this._coverAnim.setAnimation(this._coverFoilAnimationMap.UNREVEALED.STATIC);
        // this._frameCoverAnim.setAnimation(this._coverFoilAnimationMap.UNREVEALED.MOUSEOUTFRAME);

        this._gameSymbolCard.resetIdleAnimationIfNeeded();

        // TweenMax.killTweensOf(this._coverAnim.scale);
        //this._coverAnim.scale.set(1, 1);

        // TweenMax.killTweensOf(this._frameCoverAnim.scale);
        // this._frameCoverAnim.scale.set(1, 1);
        // }
        // },
        // });
        this._coverAnim.play();
        this._frameCoverAnim.play();

        // Scale the anim down again
        TweenMax.to(this._coverAnim.scale, 1 / 3, { x: 1, y: 1 });
        TweenMax.to(this._frameCoverAnim.scale, 1 / 3, { x: 1, y: 1 });
    }

    public playStaticAnimation() {
        this._coverAnim.setAnimation(this._coverFoilAnimationMap.UNREVEALED.STATIC);
        this._coverAnim.play();
    }

    public playIdleAnimation() {
        this._coverAnim.setAnimation(this._coverFoilAnimationMap.UNREVEALED.IDLE, undefined, true);
        this._frameCoverAnim.setAnimation(this._coverFoilAnimationMap.UNREVEALED.IDLEFRAME, undefined, true);
        this._coverAnim.play();
        this._frameCoverAnim.play();
    }

    public isCoverAnimationInStaticState(): boolean {
        return (
            this._coverAnim.spine.state.getCurrent(0).animation.name === this._coverFoilAnimationMap.UNREVEALED.STATIC
        );
    }

    /**
     * removeSpineListeners
     */
    private removeSpineListeners(spineAnim: SpineAnimation): void {
        spineAnim.spine.state.listeners.forEach((listener: any) => {
            spineAnim.spine.state.removeListener(listener);
        });
    }

    public playWinGlowAnimation(waitForDelay, resolve) {
        this._winGlowAnim.renderable = true;
        this._winGlowAnim.updateTransform();
        this._winGlowAnim.setAnimation("glow", undefined, false);
        this._winGlowAnim.play();
        if (waitForDelay) {
            this.removeSpineListeners(this._winGlowAnim);
            this._winGlowAnim.spine.state.addListener({
                complete: (entry) => {
                    //TODO: could add 0.1 or 0.3 secs more delay to let each winning sound have a chance to finish, but might not needed
                    if (resolve) {
                        resolve();
                    }
                },
            });
        }
    }

    public async playBonusWinAnimation(numerOfShakes: number) {
        await new Promise<void>((resolve) => {
            this._drinkGlowShakingTurns = 0;
            this._drinkGlowShakingMaxTurns = numerOfShakes;
            this._matchAnim.updateTransform();
            this._matchAnim.setAnimation(this._bonusGameSymbols.LockAndReelBonusSymbol.GLOW_SHAKE, undefined, false);
            this._matchAnim.play();
            this._drinkAnimationDelayResolve = resolve;
        });
    }

    public quickRevealForCoverAnimation() {
        this._coverAnim.updateTransform();
        this._coverAnim.scale.set(1, 1);

        if (this._gameSymbolCard.isSpecialCase()) {
            this._coverAnim.setAnimation(this._coverFoilAnimationMap.WINREVEAL.STATIC);
        } else {
            this._coverAnim.setAnimation(this._coverFoilAnimationMap.LOSEREVEAL.STATIC);
        }
        // Remove listeners
        this.removeSpineListeners(this._coverAnim);

        // Play reveal anim
        this._coverAnim.play();
    }

    private setMatchAnimAnimationToPlayAndOutroAnimationBaseOnCurrentSymbol() {
        switch (this._gameSymbolCard.symbol) {
            case "E":
                this._matchAnim.setAnimation(this._matchAnimationMap.LOSING_GAME_SYMBOLS.FLOWER.REVEAL);
                this._symbolMatchOutroAnimation = this._matchAnimationMap.LOSING_GAME_SYMBOLS.FLOWER.OUTRO;
                break;
            case "F":
                this._matchAnim.setAnimation(this._matchAnimationMap.LOSING_GAME_SYMBOLS.SUNGLASS.REVEAL);
                this._symbolMatchOutroAnimation = this._matchAnimationMap.LOSING_GAME_SYMBOLS.SUNGLASS.OUTRO;
                break;
            case "G":
                this._matchAnim.setAnimation(this._matchAnimationMap.LOSING_GAME_SYMBOLS.WATERMELON.REVEAL);
                this._symbolMatchOutroAnimation = this._matchAnimationMap.LOSING_GAME_SYMBOLS.WATERMELON.OUTRO;
                break;
            case "H":
                this._matchAnim.setAnimation(this._matchAnimationMap.LOSING_GAME_SYMBOLS.ICE_LOLLY.REVEAL);
                this._symbolMatchOutroAnimation = this._matchAnimationMap.LOSING_GAME_SYMBOLS.ICE_LOLLY.OUTRO;
                break;
            case "I":
                this._matchAnim.setAnimation(this._matchAnimationMap.LOSING_GAME_SYMBOLS.SURFBOARD.REVEAL);
                this._symbolMatchOutroAnimation = this._matchAnimationMap.LOSING_GAME_SYMBOLS.SURFBOARD.OUTRO;
                break;
            case "J":
                this._matchAnim.setAnimation(this._matchAnimationMap.LOSING_GAME_SYMBOLS.CONCH.REVEAL);
                this._symbolMatchOutroAnimation = this._matchAnimationMap.LOSING_GAME_SYMBOLS.CONCH.OUTRO;
                break;
            case "1":
                switch (gameStore.props.initialSymbol) {
                    case "A":
                        this._matchAnim.setAnimation(
                            this._matchAnimationMap.WINNING_GAME_SYMBOLS.PALM_TREE.SINGLE.REVEAL,
                        );
                        this._symbolMatchOutroAnimation = this._matchAnimationMap.WINNING_GAME_SYMBOLS.PALM_TREE.SINGLE.OUTRO;
                        break;
                    case "B":
                        this._matchAnim.setAnimation(this._matchAnimationMap.WINNING_GAME_SYMBOLS.SUN.SINGLE.REVEAL);
                        this._symbolMatchOutroAnimation = this._matchAnimationMap.WINNING_GAME_SYMBOLS.SUN.SINGLE.OUTRO;
                        break;
                    case "C":
                        this._matchAnim.setAnimation(
                            this._matchAnimationMap.WINNING_GAME_SYMBOLS.ICECREAM.SINGLE.REVEAL,
                        );
                        this._symbolMatchOutroAnimation = this._matchAnimationMap.WINNING_GAME_SYMBOLS.ICECREAM.SINGLE.OUTRO;
                        break;
                    case "D":
                        this._matchAnim.setAnimation(
                            this._matchAnimationMap.WINNING_GAME_SYMBOLS.STARFISH.SINGLE.REVEAL,
                        );
                        this._symbolMatchOutroAnimation = this._matchAnimationMap.WINNING_GAME_SYMBOLS.STARFISH.SINGLE.OUTRO;
                        break;
                    default:
                        console.error(
                            "shouldn't reach here in setMatchAnimAnimationToPlayAndOutroAnimationBaseOnCurrentSymbol() ExtendedGameSymbolCard.ts",
                        );
                        break;
                }
                break;
            case "2":
                switch (gameStore.props.initialSymbol) {
                    case "A":
                        this._matchAnim.setAnimation(
                            this._matchAnimationMap.WINNING_GAME_SYMBOLS.PALM_TREE.DOUBLE.REVEAL,
                        );
                        this._symbolMatchOutroAnimation = this._matchAnimationMap.WINNING_GAME_SYMBOLS.PALM_TREE.DOUBLE.OUTRO;
                        break;
                    case "B":
                        this._matchAnim.setAnimation(this._matchAnimationMap.WINNING_GAME_SYMBOLS.SUN.DOUBLE.REVEAL);
                        this._symbolMatchOutroAnimation = this._matchAnimationMap.WINNING_GAME_SYMBOLS.SUN.DOUBLE.OUTRO;
                        break;
                    case "C":
                        this._matchAnim.setAnimation(
                            this._matchAnimationMap.WINNING_GAME_SYMBOLS.ICECREAM.DOUBLE.REVEAL,
                        );
                        this._symbolMatchOutroAnimation = this._matchAnimationMap.WINNING_GAME_SYMBOLS.ICECREAM.DOUBLE.OUTRO;
                        break;
                    case "D":
                        this._matchAnim.setAnimation(
                            this._matchAnimationMap.WINNING_GAME_SYMBOLS.STARFISH.DOUBLE.REVEAL,
                        );
                        this._symbolMatchOutroAnimation = this._matchAnimationMap.WINNING_GAME_SYMBOLS.STARFISH.DOUBLE.OUTRO;
                        break;
                    default:
                        console.error(
                            "shouldn't reach here in setMatchAnimAnimationToPlayAndOutroAnimationBaseOnCurrentSymbol() ExtendedGameSymbolCard.ts",
                        );
                        break;
                }
                break;
            case "3":
                switch (gameStore.props.initialSymbol) {
                    case "A":
                        this._matchAnim.setAnimation(
                            this._matchAnimationMap.WINNING_GAME_SYMBOLS.PALM_TREE.TRIPLE.REVEAL,
                        );
                        this._symbolMatchOutroAnimation = this._matchAnimationMap.WINNING_GAME_SYMBOLS.PALM_TREE.TRIPLE.OUTRO;
                        break;
                    case "B":
                        this._matchAnim.setAnimation(this._matchAnimationMap.WINNING_GAME_SYMBOLS.SUN.TRIPLE.REVEAL);
                        this._symbolMatchOutroAnimation = this._matchAnimationMap.WINNING_GAME_SYMBOLS.SUN.TRIPLE.OUTRO;
                        break;
                    case "C":
                        this._matchAnim.setAnimation(
                            this._matchAnimationMap.WINNING_GAME_SYMBOLS.ICECREAM.TRIPLE.REVEAL,
                        );
                        this._symbolMatchOutroAnimation = this._matchAnimationMap.WINNING_GAME_SYMBOLS.ICECREAM.TRIPLE.OUTRO;
                        break;
                    case "D":
                        this._matchAnim.setAnimation(
                            this._matchAnimationMap.WINNING_GAME_SYMBOLS.STARFISH.TRIPLE.REVEAL,
                        );
                        this._symbolMatchOutroAnimation = this._matchAnimationMap.WINNING_GAME_SYMBOLS.STARFISH.TRIPLE.OUTRO;
                        break;
                    default:
                        console.error(
                            "shouldn't reach here in setMatchAnimAnimationToPlayAndOutroAnimationBaseOnCurrentSymbol() ExtendedGameSymbolCard.ts",
                        );
                        break;
                }
                break;
            case "T":
                this._matchAnim.setAnimation(this._bonusGameSymbols.LockAndReelBonusSymbol.REVEAL);
                this._symbolMatchOutroAnimation = this._bonusGameSymbols.LockAndReelBonusSymbol.OUTRO;
                break;
            case "X":
            case "Y":
            case "Z":
                this._matchAnim.setAnimation(this._bonusGameSymbols.InstantWin.REVEAL);
                this._symbolMatchOutroAnimation = this._bonusGameSymbols.InstantWin.OUTRO;
                break;
            default:
                console.error(
                    "Shouldn't reach here in setMatchAnimAnimationToPlayAndOutroAnimationBaseOnCurrentSymbol() ExtendedGameSymbolCard.ts",
                );
                break;
        }
        this._matchAnim.play();
    }

    public quickRevealSpineAnimation(): void {
        this._matchAnim.renderable = true;
        this._matchAnim.alpha = 1;
        this._matchAnim.updateTransform();
        this.setMatchAnimAnimationToPlayAndOutroAnimationBaseOnCurrentSymbol();
        this.removeSpineListeners(this._matchAnim);
    }
}
