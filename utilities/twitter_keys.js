const Twit = require("twit")

var TwitterApi = new Twit({
    consumer_key:         '1wjtMrEze2zwFQmupP56GPAsG',
    consumer_secret:      'kNQ1eKBRZK7bzg1j0CVyzBd8lzxXcIOrVhYmzoJRBHwTOXGRMI',
    access_token:         '2524611181-R4KLFbsa7ZcVcbc1kgGkq6VTkILGYiCPv9fpvi3',
    access_token_secret:  'mBHEDyi5ujkvhIbe7riThrErDmm11OlMQ4jEA07yScGZP',
    timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
    strictSSL:            true,    // optional - requires SSL certificates to be valid.
    
    
  })

module.exports = TwitterApi;