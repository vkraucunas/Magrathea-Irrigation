var log = require('technicolor-logger');
var lambda = require('./lambda');
var scheduleDAO = require('./db/daos/ScheduleDAO');

function run(schedule) {
    var promise = new Promise((resolve, reject) => {
        if (schedule.IsRunning) { return resolve(); }

        log.info('Starting Schedule: ' + schedule.Name);

        try {
            lambda.execute(schedule.Lambda, 'start')
                .then((result) => {
                    scheduleDAO.ScheduleById(schedule.Id)
                        .update({
                            IsRunning: true
                        })
                        .then(resolve)
                        .catch(reject);
                }).catch(reject);
        } catch (err) {
            return reject(err);
        }
    });

    return promise;
}

function stop(schedule) {
    var promise = new Promise((resolve, reject) => {
        if (!schedule.IsRunning) { return resolve(); }

        log.info('Stopping Schedule: ' + schedule.Name);

        try {
            lambda.execute(schedule.Lambda, 'cleanup')
                .then((result) => {
                    scheduleDAO.ScheduleById(schedule.Id)
                        .update({
                            IsRunning: false
                        })
                        .then(resolve)
                        .catch(reject);
                }).catch(reject);
        } catch (err) {
            return reject(err);
        }
    });

    return promise;
}

exports.run = run;
exports.stop = stop;