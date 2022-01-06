//configurations for common components

import { Orientation } from "playa-core";

type Screen = [Orientation, number, number, number, number];

export const landscape: Screen = [Orientation.LANDSCAPE, 1440, 810, 2040, 1410];
export const portrait: Screen = [Orientation.PORTRAIT, 810, 1440, 1410, 2040];
