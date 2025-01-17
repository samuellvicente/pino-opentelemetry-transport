'use strict'

const build = require('pino-abstract-transport')
const { getOtlpLogger } = require('otlp-logger')
const { toOpenTelemetry } = require('./opentelemetry-mapper')
const DEFAULT_MESSAGE_KEY = 'msg'

/**
 * Pino OpenTelemetry transport
 *
 * @typedef {Object} PinoOptions
 * @property {string} [messageKey="msg"]
 *
 * @typedef {PinoOptions & import('otlp-logger').Options} Options
 *
 * @param { Options } opts
 */
module.exports = async function (opts) {
  const logger = getOtlpLogger(opts)

  const mapperOptions = {
    messageKey: opts.messageKey || DEFAULT_MESSAGE_KEY
  }

  return build(
    async function (/** @type { AsyncIterable<Bindings> } */ source) {
      for await (const obj of source) {
        logger.emit(toOpenTelemetry(obj, mapperOptions))
      }
    },
    {
      async close () {
        return logger.shutdown()
      }
    }
  )
}
