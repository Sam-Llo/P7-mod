import { Ease, TimelineMax } from "gsap";
import { Sprite } from "pixi.js";
import { BaseView, loaderService, ParentDef } from "playa-core";

export enum CurrentVisibleReel {
    FirstReel,
    SecondReel,
    ThirdReel,
}
/**
 * Reel
 * Used as a sinle cell that presents a single column spinning, consider create a list of them for a
 */
export class Reel extends BaseView<any, null, any, null> {
    private _isMaskOn = false;

    private _isInitialMaskSet = false;

    protected _landingEase!: Ease;

    protected _reelMask!: Sprite;

    protected _reel1!: Sprite;

    protected _reel2!: Sprite;

    protected _reel3!: Sprite;

    private _leftMostOffScreenX: number = -96; //Defalt example value

    private _bottomMostOffScreenY: number = 396; //Defalt example value

    private _firstReelX: number = 0; //Defalt example value

    private _firstReelY: number = 300; //Defalt example value

    private _secondReelX: number = 96; //Defalt example value

    private _secondReelY: number = 204; //Defalt example value

    private _thirdReelX: number = 192; //Defalt example value

    private _thirdReelY: number = 108; //Defalt example value

    //from 0 to maxStopSpinCounter -1, not including maxStopSpinCounter
    protected _currentSpinCounter: number = 0;

    //Used to tell which reel should change its sprite based what is visible on screen right now
    protected _currentVisibleReel: CurrentVisibleReel = CurrentVisibleReel.FirstReel; //value can be 0, 1 and 2, represents 3 moving elements

    private _spinTimeIncrement = 0.05; //default is 0.05

    private _spinSpeedAccumulator: number = 0;

    private _currentSpinSpeed: number = 0.1;

    protected _isReelLanding!: boolean;

    protected _symbolsTextureNameMap!: Map<string, string>;

    protected _landingSymbol!: string;

    private _currentEaseType!: Ease;

    private _isWinningSymbolSelected = false;

    protected _halfSpinCount!: number;

    protected _config;

    private _configFileName;

    private _maskGraphics!: PIXI.Graphics;

    private _maskObject;

    private _autoGenerateMask: boolean;

    private _isAlive: boolean;

    public constructor(
        assetIds: string[],
        layoutId: string,
        landingEaseType: Ease,
        configFileName: string,
        autoGenerateMask: boolean,
    ) {
        super(new ParentDef(null, null), {}, undefined, assetIds, layoutId);
        this._landingEase = landingEaseType;
        this._configFileName = configFileName;
        this._isInitialMaskSet = false;
        this._autoGenerateMask = autoGenerateMask;
        this._isAlive = true;
    }

    /**
     * Init
     */
    protected async init(): Promise<void> {
        // Throw error if layout undefined
        if (this.layout === undefined) {
            throw new Error("Layout data not yet set");
        }

        // Build the layout
        this.build(this.layout, new Map(), this.container);

        this._reel1 = this.container.children.find((obj: any) => obj.name.startsWith("reel_1")) as Sprite;
        this._reel2 = this.container.children.find((obj: any) => obj.name.startsWith("reel_2")) as Sprite;
        this._reel3 = this.container.children.find((obj: any) => obj.name.startsWith("reel_3")) as Sprite;
        if (this._autoGenerateMask === false) {
            this._maskObject = this.container.children.find((obj: any) => obj.name.startsWith("reel_mask")) as Sprite;
        }
        this._config = this.assets.get(this._configFileName);

        this.setMaskToNormalSymbolSize();

        this._spinSpeedAccumulator = 0;
        this.setUpPositioningReadyForSpin();
        this._halfSpinCount = this._config.MaxStopSpinCounter / 2;
        this._symbolsTextureNameMap = new Map<string, string>();
        this.setUpSymbolsTextureNameMap();
        this.calculateBaseSpeed();
        this.reset();
        this.calculatePositioning(this._config.LocalPositionX, this._config.LocalPositionY);
        const random1 = Math.floor(Math.random() * this._symbolsTextureNameMap.size);
        const random2 = Math.floor(Math.random() * this._symbolsTextureNameMap.size);
        const random3 = Math.floor(Math.random() * this._symbolsTextureNameMap.size);

        this._reel1.texture = loaderService.fromCache(this._symbolsTextureNameMap.get(
            Array.from(this._symbolsTextureNameMap.keys())[random1],
        ) as string);

        this._reel2.texture = loaderService.fromCache(this._symbolsTextureNameMap.get(
            Array.from(this._symbolsTextureNameMap.keys())[random2],
        ) as string);
        this._reel3.texture = loaderService.fromCache(this._symbolsTextureNameMap.get(
            Array.from(this._symbolsTextureNameMap.keys())[random3],
        ) as string);
        if (this._config.IsHorizontalSpin === false) {
            this._reel2.position.set(this._reel1.position.x, this._secondReelY);
            this._reel3.position.set(this._reel1.position.x, this._thirdReelY); //put reel_3 before 1
        }
    }

    private calculatePositioning(localPositionX: number, localPositionY: number): void {
        this._firstReelX = localPositionX; //Defalt example value

        this._firstReelY = localPositionY; //Defalt example value

        this._leftMostOffScreenX = this._firstReelX - this._config.SymbolWidth; //Defalt example value

        this._bottomMostOffScreenY = this._firstReelY + this._config.SymbolHeight; //Defalt example value

        this._secondReelX = this._firstReelX + this._config.SymbolWidth; //Defalt example value

        this._secondReelY = this._firstReelY - this._config.SymbolHeight; //Defalt example value

        this._thirdReelX = this._secondReelX + this._config.SymbolWidth; //Defalt example value

        this._thirdReelY = this._secondReelY - this._config.SymbolHeight; //Defalt example value
    }

    public reset(): void {
        this.showVisuals(true);

        this._isReelLanding = false;

        this._spinSpeedAccumulator = 0;
        this._currentSpinCounter = 0;
        if (this.isCustomSpeedControlledInConfigFile()) {
            this._currentSpinSpeed =
                this._config.LandingSpinSpeed * this._config.CustomSpinSpeedControl[this._currentSpinCounter];
        } else {
            this._currentSpinSpeed = this._config.LandingSpinSpeed;
        }

        this._isWinningSymbolSelected = false;

        //Current Ease Type will be equal to none by default, only the last landing one will have special landing ease type
        this._currentEaseType = new Ease();
        this._landingSymbol = "";
    }

    protected isSpinFinished(): boolean {
        //Spins from 0 to max stop spin count -1
        if (this._currentSpinCounter < this._config.MaxStopSpinCounter) return false;

        return true;
    }

    protected modifySpinCounterAndSpeed() {
        this.setFirstElementToBeTheWinningSymbol(); //TODO: most likely gonna need to move this out of this method and let it being called separately

        this._currentSpinCounter++;
        this.changeSpeedBasedCurrentCounter();

        this.checkForEndOfSpin();
    }

    private isCustomSpeedControlledInConfigFile(): boolean {
        return (
            this._config.CustomSpinSpeedControl &&
            this._config.CustomSpinSpeedControl.length === this._config.MaxStopSpinCounter
        );
    }

    protected changeSpeedBasedCurrentCounter() {
        //from current counter 0 to 11 are counted, when current spin counter reaches 12, the spin stops.
        if (this.isCustomSpeedControlledInConfigFile()) {
            if (this._currentSpinCounter !== this._config.MaxStopSpinCounter) {
                //only from 0 to 11. 0 is used when resetting the speed, in here only 1 to 11.
                this._currentSpinSpeed =
                    this._config.LandingSpinSpeed * this._config.CustomSpinSpeedControl[this._currentSpinCounter];
            }
        } else if (this._halfSpinCount > this._currentSpinCounter) {
            this._spinSpeedAccumulator += this._spinTimeIncrement;
            //spin speed is incrementing
            this._currentSpinSpeed -= this._spinSpeedAccumulator;
        } else {
            //spin speed is decrementing
            this._currentSpinSpeed += this._spinSpeedAccumulator;
            this._spinSpeedAccumulator -= this._spinTimeIncrement;
        }
    }

    protected isTheReelWinningSymbol(symbolToLand: string): boolean {
        return false;
    }

    protected onComplete(): void {
        switch (this._currentVisibleReel) {
            case CurrentVisibleReel.FirstReel:
                this._reel2.renderable = false;
                this._reel3.renderable = false;
                break;
            case CurrentVisibleReel.SecondReel:
                this._reel1.renderable = false;
                this._reel3.renderable = false;
                break;
            case CurrentVisibleReel.ThirdReel:
                this._reel1.renderable = false;
                this._reel2.renderable = false;
                break;
            default:
                //Shouldn't reach here
                break;
        }
    }

    private setMaskToNormalSymbolSize() {
        if (this._isMaskOn === false && this._isInitialMaskSet) {
            if (this._autoGenerateMask === true) {
                this._maskGraphics.renderable = true;
                this.container.mask = this._maskGraphics;
            } else {
                this._maskObject.renderable = true;
                this.container.mask = this._maskObject;
            }
            return;
        }

        if (this._isInitialMaskSet) return;
        if (this._autoGenerateMask === true) {
            this._maskGraphics = new PIXI.Graphics();
            this._maskGraphics.beginFill(0xffffff);
            this._maskGraphics.drawRect(
                this._reel1.position.x - this._config.SymbolWidth / 2,
                this._reel1.position.y - this._config.SymbolHeight / 2,
                this._config.SymbolWidth,
                this._config.SymbolHeight,
            );

            this._maskGraphics.endFill();
            this.container.addChild(this._maskGraphics);
            this.container.mask = this._maskGraphics;
        } else {
            this.container.addChild(this._maskObject);
            this.container.mask = this._maskObject;
        }

        this._isMaskOn = true;
        this._isInitialMaskSet = true;
    }

    private setMaskToOff() {
        this._isMaskOn = false;
        this.container.mask = null as any;
        if (this._maskGraphics) this._maskGraphics.renderable = false;
        if (this._maskObject) this._maskObject.renderable = false;
    }

    protected presentWin(): void {
        this.bringToFront();
        this.setMaskToOff();
    }

    protected async spinVertically() {
        if (this._isAlive === false) return;
        await this.verticalFirstSpinTurn();

        if (this.isSpinFinished()) {
            return;
        }

        await this.verticalSecondSpinTurn();

        if (this.isSpinFinished()) {
            return;
        }

        await this.verticalThirdSpinTurn();

        if (this.isSpinFinished()) {
            return;
        }

        this.spinVertically();
    }

    protected async verticalFirstSpinTurn() {
        if (this._currentVisibleReel !== CurrentVisibleReel.FirstReel) return;

        await new Promise<void>((resolve) => {
            const timeLine1 = new TimelineMax({
                onComplete: () => {
                    this._currentVisibleReel = CurrentVisibleReel.SecondReel;
                    this.checkForSlowDownToLand();
                    resolve();
                },
            });
            timeLine1.fromTo(
                this._reel1.position,
                this._currentSpinSpeed,
                { x: this._reel1.position.x, y: this._firstReelY, ease: this._currentEaseType },
                { x: this._reel1.position.x, y: this._bottomMostOffScreenY, ease: this._currentEaseType },
                "0",
            );
            timeLine1.fromTo(
                this._reel2.position,
                this._currentSpinSpeed,
                { x: this._reel1.position.x, y: this._secondReelY, ease: this._currentEaseType },
                { x: this._reel1.position.x, y: this._firstReelY, ease: this._currentEaseType },
                "0",
            );
            timeLine1.fromTo(
                this._reel3.position,
                this._currentSpinSpeed,
                { x: this._reel1.position.x, y: this._thirdReelY, ease: this._currentEaseType },
                { x: this._reel1.position.x, y: this._secondReelY, ease: this._currentEaseType },
                "0",
            );
        });
    }

    protected async verticalSecondSpinTurn() {
        if (this._currentVisibleReel !== CurrentVisibleReel.SecondReel) return;

        await new Promise<void>((resolve) => {
            const timeLine2 = new TimelineMax({
                onComplete: () => {
                    this._currentVisibleReel = CurrentVisibleReel.ThirdReel;
                    this.checkForSlowDownToLand();
                    resolve();
                },
            });
            timeLine2.fromTo(
                this._reel1.position,
                this._currentSpinSpeed,
                { x: this._reel1.position.x, y: this._thirdReelY, ease: this._currentEaseType },
                { x: this._reel1.position.x, y: this._secondReelY, ease: this._currentEaseType },
                "0",
            );
            timeLine2.fromTo(
                this._reel2.position,
                this._currentSpinSpeed,
                { x: this._reel1.position.x, y: this._firstReelY, ease: this._currentEaseType },
                { x: this._reel1.position.x, y: this._bottomMostOffScreenY, ease: this._currentEaseType },
                "0",
            );
            timeLine2.fromTo(
                this._reel3.position,
                this._currentSpinSpeed,
                { x: this._reel1.position.x, y: this._secondReelY, ease: this._currentEaseType },
                { x: this._reel1.position.x, y: this._firstReelY, ease: this._currentEaseType },
                "0",
            );
        });
    }

    protected async verticalThirdSpinTurn() {
        if (this._currentVisibleReel !== CurrentVisibleReel.ThirdReel) return;

        await new Promise<void>((resolve) => {
            const timeLine3 = new TimelineMax({
                onComplete: () => {
                    this._currentVisibleReel = CurrentVisibleReel.FirstReel;
                    this.checkForSlowDownToLand();
                    resolve();
                },
            });
            timeLine3.fromTo(
                this._reel1.position,
                this._currentSpinSpeed,
                { x: this._reel1.position.x, y: this._secondReelY, ease: this._currentEaseType },
                { x: this._reel1.position.x, y: this._firstReelY, ease: this._currentEaseType },
                "0",
            );
            timeLine3.fromTo(
                this._reel2.position,
                this._currentSpinSpeed,
                { x: this._reel1.position.x, y: this._thirdReelY, ease: this._currentEaseType },
                { x: this._reel1.position.x, y: this._secondReelY, ease: this._currentEaseType },
                "0",
            );
            timeLine3.fromTo(
                this._reel3.position,
                this._currentSpinSpeed,
                { x: this._reel1.position.x, y: this._firstReelY, ease: this._currentEaseType },
                {
                    x: this._reel1.position.x,
                    y: this._bottomMostOffScreenY,
                    ease: this._currentEaseType,
                },
                "0",
            );
        });
    }

    public showVisuals(isShow: boolean): void {
        if (isShow === false) {
            this._reel1.renderable = false;
            this._reel2.renderable = false;
            this._reel3.renderable = false;
            this._reel1.visible = false;
            this._reel2.visible = false;
            this._reel3.visible = false;
        } else {
            this._reel1.renderable = true;
            this._reel2.renderable = true;
            this._reel3.renderable = true;
            this._reel1.visible = true;
            this._reel2.visible = true;
            this._reel3.visible = true;
        }
    }

    /**
     * spinForever
     * used when player first enter the game or just finished game, initial selecting symbols spining will spin forever
     */
    protected async spinHorizontally() {
        if (this._isAlive === false) return;

        await this.horizontalFirstSpinTurn();

        if (this.isSpinFinished()) {
            return;
        }
        await this.horizontalSecondSpinTurn();

        if (this.isSpinFinished()) {
            return;
        }
        await this.horizontalThirdSpinTurn();

        if (this.isSpinFinished()) {
            return;
        }
        this.spinHorizontally();
    }

    protected checkForSlowDownToLand(): void {
        this.modifySpinCounterAndSpeed();
        if (this.isSpinFinished() === true) {
            //last turn Landing
            if (this.isTheReelWinningSymbol(this._landingSymbol)) this.presentWin();

            this.onComplete();
        }
    }

    private async horizontalFirstSpinTurn() {
        if (this._currentVisibleReel !== CurrentVisibleReel.FirstReel) return;

        await new Promise<void>((resolve) => {
            const timeLine1 = new TimelineMax({
                onComplete: () => {
                    this._currentVisibleReel = CurrentVisibleReel.SecondReel;
                    this.checkForSlowDownToLand();
                    resolve();
                },
            });
            timeLine1.fromTo(
                this._reel1.position,
                this._currentSpinSpeed,
                { x: this._firstReelX, ease: this._currentEaseType },
                { x: this._leftMostOffScreenX, ease: this._currentEaseType },
                "0",
            );
            timeLine1.fromTo(
                this._reel2.position,
                this._currentSpinSpeed,
                { x: this._secondReelX, ease: this._currentEaseType },
                { x: this._firstReelX, ease: this._currentEaseType },
                "0",
            );
            timeLine1.fromTo(
                this._reel3.position,
                this._currentSpinSpeed,
                { x: this._thirdReelX, ease: this._currentEaseType },
                { x: this._secondReelX, ease: this._currentEaseType },
                "0",
            );
        });
    }

    private async horizontalSecondSpinTurn() {
        if (this._currentVisibleReel !== CurrentVisibleReel.SecondReel) return;

        await new Promise<void>((resolve) => {
            const timeLine2 = new TimelineMax({
                onComplete: () => {
                    this._currentVisibleReel = CurrentVisibleReel.ThirdReel;
                    this.checkForSlowDownToLand();
                    resolve();
                },
            });
            timeLine2.fromTo(
                this._reel1.position,
                this._currentSpinSpeed,
                { x: this._thirdReelX, ease: this._currentEaseType },
                { x: this._secondReelX, ease: this._currentEaseType },
                "0",
            );
            timeLine2.fromTo(
                this._reel2.position,
                this._currentSpinSpeed,
                { x: this._firstReelX, ease: this._currentEaseType },
                { x: this._leftMostOffScreenX, ease: this._currentEaseType },
                "0",
            );
            timeLine2.fromTo(
                this._reel3.position,
                this._currentSpinSpeed,
                { x: this._secondReelX, ease: this._currentEaseType },
                { x: this._firstReelX, ease: this._currentEaseType },
                "0",
            );
        });
    }

    private async horizontalThirdSpinTurn() {
        if (this._currentVisibleReel !== CurrentVisibleReel.ThirdReel) return;

        await new Promise<void>((resolve) => {
            const timeLine3 = new TimelineMax({
                onComplete: () => {
                    this._currentVisibleReel = CurrentVisibleReel.FirstReel;
                    this.checkForSlowDownToLand();
                    resolve();
                },
            });
            timeLine3.fromTo(
                this._reel1.position,
                this._currentSpinSpeed,
                { x: this._secondReelX, ease: this._currentEaseType },
                { x: this._firstReelX, ease: this._currentEaseType },
                "0",
            );
            timeLine3.fromTo(
                this._reel2.position,
                this._currentSpinSpeed,
                { x: this._thirdReelX, ease: this._currentEaseType },
                { x: this._secondReelX, ease: this._currentEaseType },
                "0",
            );
            timeLine3.fromTo(
                this._reel3.position,
                this._currentSpinSpeed,
                { x: this._firstReelX },
                { x: this._leftMostOffScreenX, ease: this._currentEaseType },
                "0",
            );
        });
    }

    /**
     * setFirstElementToBeTheWinningSymbol
     */
    protected setFirstElementToBeTheWinningSymbol(): void {
        const randomNum = Math.floor(Math.random() * this._symbolsTextureNameMap.size);
        switch (this._currentVisibleReel) {
            case CurrentVisibleReel.FirstReel:
                this._reel3.texture = loaderService.fromCache(this._symbolsTextureNameMap.get(
                    Array.from(this._symbolsTextureNameMap.keys())[randomNum],
                ) as string);
                break;
            case CurrentVisibleReel.SecondReel:
                if (this._isWinningSymbolSelected === false) {
                    this._reel1.texture = loaderService.fromCache(this._symbolsTextureNameMap.get(
                        Array.from(this._symbolsTextureNameMap.keys())[randomNum],
                    ) as string);
                }
                break;
            case CurrentVisibleReel.ThirdReel:
                this._reel2.texture = loaderService.fromCache(this._symbolsTextureNameMap.get(
                    Array.from(this._symbolsTextureNameMap.keys())[randomNum],
                ) as string);
                break;
            default:
                console.error("Shouldn't reach her, Reel.ts");
                break;
        }
    }

    protected checkForEndOfSpin() {
        const leftSpinTurns = this._config.MaxStopSpinCounter - this._currentSpinCounter;
        if (leftSpinTurns === 1) {
            if (this._isWinningSymbolSelected === true) return;

            this._isWinningSymbolSelected = true;

            switch (this._currentVisibleReel) {
                case CurrentVisibleReel.FirstReel:
                    this._reel2.texture = loaderService.fromCache(this._symbolsTextureNameMap.get(
                        this._landingSymbol,
                    ) as string);
                    break;
                case CurrentVisibleReel.SecondReel:
                    this._reel3.texture = loaderService.fromCache(this._symbolsTextureNameMap.get(
                        this._landingSymbol,
                    ) as string);
                    break;
                case CurrentVisibleReel.ThirdReel:
                    this._reel1.texture = loaderService.fromCache(this._symbolsTextureNameMap.get(
                        this._landingSymbol,
                    ) as string);
                    break;
                default:
                    //Shouln't reach here
                    break;
            }

            this._currentEaseType = this._landingEase;
            //Set currentSpinSpeed to double the durration length of landing spin speed, so we can apply ease easily and more naturally at last spin
            if (this.isCustomSpeedControlledInConfigFile() === false) {
                this._currentSpinSpeed = this._config.LandingSpinSpeed * 2;
            }
        }
    }

    private setUpPositioningReadyForSpin(): void {
        //Set up horizontal spin spacing (right to left spin)
        this._leftMostOffScreenX = this._reel1.position.x - this._reel1.width;
        this._firstReelX = this._reel1.position.x;
        this._secondReelX = this._reel1.position.x + this._reel1.width;
        this._thirdReelX = this._reel1.position.x + this._reel1.width + this._reel1.width;

        //Set up vertical spin spacing (top to bottom spin)
        this._bottomMostOffScreenY = this._reel1.position.y + this._reel1.height;
        this._firstReelY = this._reel1.position.y;
        this._secondReelY = this._reel1.position.y - this._reel1.height;
        this._thirdReelY = this._reel1.position.y - this._reel1.height - this._reel1.height;
    }

    protected setUpSymbolsTextureNameMap(): void {
        this._symbolsTextureNameMap = new Map<string, string>();
        this._symbolsTextureNameMap.set("1", "symbolBonus4Static_img");
        this._symbolsTextureNameMap.set("2", "symbolBonus10Static");
        this._symbolsTextureNameMap.set("3", "symbolBonus11Static");
        this._symbolsTextureNameMap.set("K", "symbolBonus1Static_img");
        this._symbolsTextureNameMap.set("L", "symbolBonus2Static_img");
        this._symbolsTextureNameMap.set("M", "symbolBonus3Static_img");
        this._symbolsTextureNameMap.set("N", "symbolBonus5Static_img");
        this._symbolsTextureNameMap.set("O", "symbolBonus6Static_img");
        this._symbolsTextureNameMap.set("P", "symbolBonus7Static_img");
        this._symbolsTextureNameMap.set("Q", "symbolBonus8Static_img");
        this._symbolsTextureNameMap.set("R", "symbolBonus9Static_img");
    }

    private calculateBaseSpeed() {
        // initialize result
        let sumOfNumbersAllTheWayToHalfMinusOne = 0;
        // One by one compute sum of digits
        // in every number from 1 to n
        for (let x = 1; x < this._halfSpinCount; x++) sumOfNumbersAllTheWayToHalfMinusOne += x;

        this._spinTimeIncrement =
            (this._config.LandingSpinSpeed - this._config.PeakSpinSpeed) / sumOfNumbersAllTheWayToHalfMinusOne;
    }

    /**
     * spin
     * @param symbolToLand the index of elements that this spin will lands on
     */
    public land(symbolToLand: string): void {
        if (this.isTheReelWinningSymbol(this._landingSymbol)) {
            //already a winning number being displayed, return from here
            return;
        }

        this.reset();
        this._landingSymbol = symbolToLand;
        this._isReelLanding = true;
        if (this._config.IsHorizontalSpin) {
            this.spinHorizontally();
        } else {
            this.spinVertically();
        }
    }

    protected bringToFront(): void {
        this.container.parent.setChildIndex(this.container, this.container.parent.children.length - 1);
    }

    /**
     * stopSpinForever
     * by calling this method, this spin will remain inactive through out, only can be actived again by calling enableSpin()
     */
    public stopSpinForever() {
        this._isAlive = false;
    }

    /**
     * enableSpin
     * should only be called to re-enable spin after stopSpinForever being called
     */
    public enableSpin() {
        this._isAlive = true;
    }

    /**
     * setInitialSymbol
     * used to re-initialise the initial symbol
     * @param symbolToLand the initial symbols to set this reel to
     */
    public setInitialSymbol(symbolToLand: string): void {
        this.setMaskToNormalSymbolSize();

        this._reel1.texture = loaderService.fromCache(this._symbolsTextureNameMap.get(symbolToLand) as string);
        this._reel2.texture = loaderService.fromCache(this._symbolsTextureNameMap.get(symbolToLand) as string);
        this._reel3.texture = loaderService.fromCache(this._symbolsTextureNameMap.get(symbolToLand) as string);
        this._landingSymbol = symbolToLand;
    }
}
