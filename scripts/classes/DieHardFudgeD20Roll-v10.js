/*
Because this extends D20Roll, I could not find a clean way to import.  I tried multiple hacks, and ended up following this example:

// CONFIG.Dice.D20Roll
// game.dnd5e.dice.D20Roll

 */

import { dice } from "../../../../systems/dnd5e/dnd5e.mjs";

export default class DieHardFudgeD20Roll extends dice.D20Roll {
	// This is a simple extension
	constructor(formula, data, options) {
		super(formula, data, options);
	}
	static get defaultOptions() {
		return super.defaultOptions;
	}
}
