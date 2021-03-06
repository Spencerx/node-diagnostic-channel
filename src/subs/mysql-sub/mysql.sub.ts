// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
import * as ApplicationInsights from "applicationinsights";
import {channel, IStandardEvent} from "diagnostic-channel";

import {mysql} from "diagnostic-channel-publishers";

export const subscriber = (event: IStandardEvent<mysql.IMysqlData>) => {
    if (ApplicationInsights._isDependencies && ApplicationInsights.client) {
        const queryObj = event.data.query || {};
        const sqlString = queryObj.sql || "Unknown query";
        const success = !event.data.err;

        const connection = queryObj._connection || {};
        const connectionConfig = connection.config || {};
        const dbName = connectionConfig.socketPath ? connectionConfig.socketPath : `${connectionConfig.host || 'localhost'}:${connectionConfig.port}`;
        ApplicationInsights.client.trackDependency(
                dbName,
                sqlString,
                event.data.duration | 0,
                success,
                'mysql');
    }
};

channel.subscribe<mysql.IMysqlData>('mysql', subscriber);