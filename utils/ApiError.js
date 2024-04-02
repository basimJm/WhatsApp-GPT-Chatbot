// this class is resbonabile about operation error  (error i can predict)

class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith(4) ? `fail` : `error`;
    this.isOperational = true; // thats mean i send this error
  }
}
module.exports = ApiError;
