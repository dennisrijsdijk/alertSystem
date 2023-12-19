import {JsonDB} from "node-json-db";
import {ScriptModules} from "@crowbartools/firebot-custom-scripts-types";
import {
    Alert,
    AlertMeta,
    AlertType,
    CheerAlertMeta, CommunityGiftSubAlertMeta,
    GiftedSubAlertMeta,
    SubAlertMeta,
    TipAlertMeta
} from "../@types/Alert";

class AlertsManager {
    private _db: JsonDB;
    constructor(path: string, modules: ScriptModules) {
        // @ts-ignore 😠
        // filePath, saveOnPush, humanReadable
        this._db = new modules.JsonDb(path, true, true);
    }

    public addAlert(id: string, alert: Alert): void {
        this._db.push(`/${id}`, alert);
    }

    public removeAlert(id: string): boolean {
        if (!this._db.exists(`/${id}`)) {
            return false;
        }
        this._db.delete(`/${id}`);
        return true;
    }

    public getAlerts(type: AlertType = null): Record<string, Alert> {
        let alerts: Record<string, Alert> = this._db.getData("/");
        if (type == null) {
            return alerts;
        }
        return Object.assign({}, ...Object.entries(alerts)
            .filter(([_,v]) => v.alertType === type)
            .map(([k,v]) => ({[k]:v}))
        );
    }

    public findClosestAlert(type: AlertType, meta: AlertMeta): Alert {

        switch (type) {
            case AlertType.CHEER: {
                const cheerMeta: CheerAlertMeta = meta as CheerAlertMeta;
                return this.findMatchingAlert(type,
                    (a: Alert, b: Alert) => (b.meta as CheerAlertMeta).bits - (a.meta as CheerAlertMeta).bits,
                    (alert: Alert) =>
                        ((alert.meta as CheerAlertMeta).bits <= cheerMeta.bits) || alert.meta.default);
            }
            case AlertType.TIP: {
                const tipMeta: TipAlertMeta = meta as TipAlertMeta;
                return this.findMatchingAlert(type,
                    (a: Alert, b: Alert) => (b.meta as TipAlertMeta).tip - (a.meta as TipAlertMeta).tip,
                    (alert: Alert) =>
                        ((alert.meta as TipAlertMeta).tip <= tipMeta.tip) || alert.meta.default);
            }
            case AlertType.SUB: {
                const subMeta: SubAlertMeta = meta as SubAlertMeta;
                return this.findMatchingAlert(type,
                    // Prioritize tier over month. all T3 alerts descending first, then T2, then T1.
                    (a: Alert, b: Alert) => {
                        let tierOrder = (b.meta as SubAlertMeta).tier - (a.meta as SubAlertMeta).tier;
                        let monthOrder = (b.meta as SubAlertMeta).months - (a.meta as SubAlertMeta).months;
                        return tierOrder || -monthOrder;
                    },
                    (alert: Alert) => {
                        let subAlertMeta: SubAlertMeta = alert.meta as SubAlertMeta;
                        if (subAlertMeta.tier > subMeta.tier) {
                            return false;
                        }
                        return subAlertMeta.months <= subMeta.months || subAlertMeta.default;
                    });
            }
            case AlertType.GIFT: {
                const giftMeta: GiftedSubAlertMeta = meta as GiftedSubAlertMeta;
                return this.findMatchingAlert(type,
                    (a: Alert, b: Alert) => {
                        let tierOrder = (b.meta as SubAlertMeta).tier - (a.meta as SubAlertMeta).tier;
                        let monthOrder = (b.meta as SubAlertMeta).months - (a.meta as SubAlertMeta).months;
                        return tierOrder || -monthOrder;
                    },
                    (alert: Alert) =>
                    {
                        let subAlertMeta: SubAlertMeta = alert.meta as SubAlertMeta;
                        if (subAlertMeta.tier > giftMeta.tier) {
                            return false;
                        }
                        return subAlertMeta.months <= giftMeta.months || subAlertMeta.default;
                    });
            }
            case AlertType.COMMUNITY: {
                const communityMeta: CommunityGiftSubAlertMeta = meta as CommunityGiftSubAlertMeta;
                return this.findMatchingAlert(type,
                    (a: Alert, b: Alert) => {
                        let tierOrder = (b.meta as CommunityGiftSubAlertMeta).tier - (a.meta as CommunityGiftSubAlertMeta).tier;
                        let countOrder = (b.meta as CommunityGiftSubAlertMeta).count - (a.meta as CommunityGiftSubAlertMeta).count;
                        return tierOrder || -countOrder;
                    },
                    (alert: Alert) =>
                    {
                        let communityAlertMeta: CommunityGiftSubAlertMeta = alert.meta as CommunityGiftSubAlertMeta;
                        if (communityAlertMeta.tier > communityMeta.tier) {
                            return false;
                        }
                        return communityAlertMeta.count <= communityMeta.count || communityAlertMeta.default;
                    });
            }
        }
    }

    private findMatchingAlert(type: AlertType, sortingPredicate: (a: Alert, b: Alert) => number, searchingPredicate: (alert: Alert) => boolean): Alert {
        let alerts = this.getAlerts(type);
        let alertsSortedDescending = Object.values(alerts).sort(sortingPredicate);
        alertsSortedDescending.forEach((alert => {
            if (searchingPredicate(alert)) {
                return alert
            }
        }));
        // Should never happen if we set a default.
        return null;
    }
}

export let alertsManager: AlertsManager;

export function createAlertsManager(path: string, modules: ScriptModules) {
    if (alertsManager == null) {
        alertsManager = new AlertsManager(path, modules);
    }
    return alertsManager;
}