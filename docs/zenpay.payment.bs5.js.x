/*!
 * zenpay.payment v3 (http://www.zenithpayments.com.au)
 * Copyright 2019 Zenith Payments.
 */

(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define(["jquery"], factory);
  } else {
    factory(root.jQuery);
  }
})(this, function ($) {
  var defaults = {
    action: "Authorise",
    hideHeader: true,
    mode: 0,
    overrideFeePayer: 0,
    userMode: 0,
    displayMode: 0,
    allowBankAcOneOffPayment: false,
    allowPayIdOneOffPayment: false,
    allowApplePayOneOffPayment: true,
    hideTermsAndConditions: false,
    showFeeOnTokenising: false,
    showFailedPaymentFeeOnTokenising: false,
    sendConfirmationEmailToCustomer: false,
    onPluginClose: $.noop,
  };

  const ZP_DISPLAY_MODE_DEFAULT = "0";
  const ZP_DISPLAY_MODE_REDIRECT = "1";

  function getPValue(value) {
    return value === "undefined" || value == null ? "" : value;
  }

  function getPBoolValue(value) {
    var pValue = getPValue(value);
    if (!isNaN(parseFloat(pValue)) && isFinite(pValue)) {
      return pValue === 1;
    }
    return pValue;
  }

  function getKeyValue(key, value) {
    if (
      key.startsWith("hide") ||
      key.startsWith("allow") ||
      key.startsWith("send") ||
      key.startsWith("show")
    ) {
      return getPBoolValue(value);
    }

    return getPValue(value);
  }

  function openPayment(payment, silent) {
    var options = payment.options;
    var generateUrlResponse = generateUrl(payment);

    if (!generateUrlResponse.isSuccess) {
      if (!silent) {
        alert(generateUrlResponse.message);
        return;
      }

      return {
        isSuccess: false,
        message: generateUrlResponse.message,
      };
    }

    // Create iframe
    var frame = $("<iframe>")
      .css({
        width: "100%",
        "min-height": generateUrlResponse.height,
        border: "0",
      })
      .attr({
        allowtransparency: "true",
        frameborder: "0",
        scrolling: "auto",
        src: generateUrlResponse.url,
      })
      .addClass("d-none zp-payment-frame");

    $(frame).on("load", function () {
      onPaymentPluginLoaded(this, options);
    });

    // Modal header
    var modalHeader = $("<div>")
      .addClass("modal-header")
      .append(
        $("<h4>")
          .addClass("modal-title")
          .html(
            getPValue(options.title) !== "" ? options.title : "Process Payment"
          ),
        $("<button>")
          .attr({
            type: "button",
            "data-bs-dismiss": "modal",
            "aria-hidden": "true",
          })
          .addClass("btn btn-sm float-end") // Changed from btn-close to original classes
          .html('<i class="fa fa-mail-reply"></i> Close & Return') // Added back the icon and text
      );

    // Modal body with loading spinner
    var modalBody = $("<div>").addClass("modal-body p-0").append(frame).append(`
                    <div class="row zp-status">
                        <div class="col-12">
                            <div class="text-center">
                                <div class="zp-spinner zp-spinner-double-bounce">
                                    <div class="zp-double-bounce1"></div>
                                    <div class="zp-double-bounce2"></div>
                                </div>
                                <h4 style="margin: 10px auto; white-space: nowrap;">
                                    Loading the payment details...
                                </h4>
                            </div>
                        </div>
                    </div>
                `);

    // Create modal structure
    var modalDialog = $("<div>")
      .addClass("modal-dialog modal-dailog-payment")
      .append(
        $("<div>")
          .addClass("modal-content")
          .append(modalHeader)
          .append(modalBody)
      );

    // Create modal container
    var modal = $("<div>")
      .addClass("modal fade modal-payment")
      .attr({
        role: "dialog",
        "aria-hidden": "true",
        "data-bs-backdrop": "static",
        "data-bs-keyboard": "false",
      })
      .append(modalDialog);

    // Add modal to body
    $("body").append(modal);

    // Add CSS to force modal width
    $("<style>")
      .text(
        `
                @media (min-width: 768px) {
                    .modal-dailog-payment {
                        width: 600px !important;
                        max-width: 690px !important;
                        margin: 30px auto;
                    }
                }
                .modal-dailog-payment .modal-content {
                    border-radius: 3px;
                }
                .modal-dailog-payment .modal-header {
                    padding: 10px 15px;
                    border-bottom: 1px solid #e5e5e5;
                }
                .modal-dailog-payment .btn-close {
                    padding: 0.5rem;
                    margin: -0.5rem -0.5rem -0.5rem auto;
                }
            `
      )
      .appendTo("head");

    // Handle modal events
    var modalInstance = new bootstrap.Modal(modal[0]);

    $(modal).on("hidden.bs.modal", function () {
      $(modal).remove();
      if (payment.options.applePayPlugin) {
        payment.options.applePayPlugin.destroy();
      }
      payment.options.onPluginClose.call(payment);
      payment.options = null;
    });

    modalInstance.show();

    if (options.allowApplePayOneOffPayment) {
      importScript(
        new URL(options.url).origin +
          "/Scripts/ZenPay/zenpay.payment.applepay.js"
      );
    }

    return {
      isSuccess: true,
    };
  }

  function closePayment() {
    var modalInstance = new bootstrap.Modal($(".modal-payment"));
    modalInstance.hide();
  }

  function generateUrl(payment) {
    var options = payment.options;

    if (
      getPValue(options.apiKey) === "" ||
      getPValue(options.fingerprint) === "" ||
      getPValue(options.action) === ""
    ) {
      return {
        isSuccess: false,
        message: "zpPayment plugin error: Not initialized.",
      };
    }

    if (
      options.url &&
      options.url.endsWith("v4") &&
      getPValue(options.merchantCode) === ""
    ) {
      return {
        isSuccess: false,
        message: "zpPayment plugin error: merchantCode cannot be empty.",
      };
    }

    if (getPValue(options.mode) === "") {
      return {
        isSuccess: false,
        message:
          "zpPayment plugin error: Mode cannot be empty. The value should be one of the following values. DefaultPayment = 0, Tokenise = 1, CustomPayment = 3",
      };
    }

    if (
      getPValue(options.callbackUrl) === "" &&
      getPValue(options.redirectUrl) === ""
    ) {
      return {
        isSuccess: false,
        message:
          "zpPayment plugin error: Both Callback Url and Redirect Url cannot be empty.",
      };
    }

    var minHeight = getPValue(options.mode) === 1 ? "450px" : "725px";
    if (getPValue(options.minHeight) > 0) {
      minHeight = options.minHeight + "px";
    }

    var parameters = [["isJsPlugin", true]];
    for (const [key, value] of Object.entries(options)) {
      const filter = key.toLowerCase();
      if (filter === "abn") {
        parameters.push(["AustralianBusinessNumber", getPValue(value)]);
      } else if (filter === "apikey") {
        parameters.push(["__ApiKey", getPValue(value)]);
      } else if (filter === "fingerprint") {
        parameters.push(["__Fingerprint", getPValue(value)]);
      } else if (filter === "cardproxy") {
        parameters.push(["token", getPValue(value)]);
      } else if (
        filter === "action" ||
        filter === "merchantcode" ||
        filter === "url"
      ) {
        continue;
      } else if (filter === "redirecturl" || filter === "callbackurl") {
        parameters.push([key, encodeURIComponent(getPValue(value))]);
      } else {
        parameters.push([key, getKeyValue(key, value)]);
      }
    }

    var urlParams = new URLSearchParams(parameters);
    return {
      isSuccess: true,
      url:
        options.url +
        (options.merchantCode && options.merchantCode !== ""
          ? "/" + options.merchantCode
          : "") +
        "/" +
        options.action +
        "?" +
        decodeURIComponent(urlParams.toString()),
      height: minHeight,
      width: "600px",
    };
  }

  function initPlugin(payment) {
    var options = payment.options;
    let displayMode = getPValue(options.displayMode).toString();
    if (displayMode === ZP_DISPLAY_MODE_DEFAULT) {
      return openPayment(payment, true);
    } else if (displayMode === ZP_DISPLAY_MODE_REDIRECT) {
      return generateUrl(payment);
    }

    throw new Error("Invalid zpPayment displayMode.");
  }

  onPaymentPluginLoaded = function (frame, options) {
    $(".zp-status").addClass("d-none");
    $(frame).removeClass("d-none");

    if (options.applePayPlugin) return;

    if ($.zpApplePay === undefined) return;

    options.applePayPlugin = $.zpApplePay({
      url: options.url,
    });
    options.applePayPlugin.init();
  };

  var importScript = function (scriptSrc) {
    var len = $("script").filter(function () {
      return $(this).attr("src") === scriptSrc;
    }).length;

    //if there are no scripts that match, the load it
    if (len === 0) {
      $.getScript(scriptSrc);
    }
  };

  var zpPayment = function (settings) {
    this.options = $.extend(this.options, defaults, settings);
  };

  zpPayment.prototype = {
    open: function () {
      openPayment(this);
    },
    init: function () {
      return initPlugin(this);
    },
    close: function () {
      closePayment();
    },
  };

  // INITIALIZE THE PLUGIN
  $.zpPayment = function (options) {
    var instance = new zpPayment(options);
    return instance;
  };
});
