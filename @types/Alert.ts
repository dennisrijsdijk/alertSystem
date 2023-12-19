export enum AlertType {
    CHEER,
    TIP,
    SUB,
    GIFT,
    COMMUNITY
}

export interface Alert {
    meta: AlertMeta;
    mediaType: mediaType;
    alertType: AlertType;
    fullscreen: boolean;
    left?: string;
    right?: string;
    bottom?: string;
    top?: string;
    width?: string;
    height?: string;
}

export interface VideoAlert extends Alert {
    mediaType: mediaType.VIDEO;
    video: string;
}

export interface RandomVideoAlert extends Alert {
    mediaType: mediaType.RANDOM_VIDEO;
    videos: string;
}

export interface ImageAlert extends Alert {
    mediaType: mediaType.IMAGE_AUDIO;
    images: string;
    sounds: string;
    minimumDuration: number;
}

export enum mediaType {
    VIDEO,
    RANDOM_VIDEO,
    IMAGE_AUDIO
}

export interface AlertMeta {
    default?: boolean;
}

export interface CheerAlertMeta extends AlertMeta {
    bits: number;
}

export interface TipAlertMeta extends AlertMeta {
    tip: number;
}

export interface SubAlertMeta extends AlertMeta {
    tier: number;
    months: number;
}

export interface GiftedSubAlertMeta extends SubAlertMeta {
    months: 1 | 3 | 6 | 12;
}

export interface CommunityGiftSubAlertMeta extends AlertMeta {
    tier: number;
    count: number;
}