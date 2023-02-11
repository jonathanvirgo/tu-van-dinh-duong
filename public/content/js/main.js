'use strict';

/* exported extend, ready */
let extend = function(out) {
  out = out || {};

  for (let i = 1; i < arguments.length; i++) {
    if (!arguments[i]) {
      continue;
    }

    for (let key in arguments[i]) {
      if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
        out[key] = arguments[i][key];
      }
    }
  }

  return out;
};

function ready(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(() => {
  // change z-index step component
  const headerFilter = document.getElementById('header-filter');

  if (headerFilter) {
    headerFilter.addEventListener('show.bs.offcanvas', () => {
      document.querySelector('body').classList.add('header-filter-show');
    });

    headerFilter.addEventListener('hidden.bs.offcanvas', () => {
      document.querySelector('body').classList.remove('header-filter-show');
    });
  }
});


// --------------------------
// headroom
// --------------------------

/* global ready, extend, Headroom */
ready(() => {
  'use strict';

  const elHeaderHeadroom = document.getElementById('header');
  if (elHeaderHeadroom) {
    let defaults = {};
    let options = extend({}, defaults, JSON.parse(elHeaderHeadroom.getAttribute('data-options')));

    const headroom = new Headroom(elHeaderHeadroom, options);
    headroom.init();
  }
});


// --------------------------
// flatpickr
// --------------------------

/* global ready, extend, flatpickr */
ready(() => {
  'use strict';

  const elFlatpickr = document.querySelectorAll('[data-plugin="flatpickr"]');
  Array.prototype.forEach.call(elFlatpickr, (el) => {
    let defaults = {
      // altInput: true,
      // altFormat: "F j, Y",
      // altInputClass: 'form-control flatpickr-input-alt',
      dateFormat: 'd-m-Y',
      conjunction: ' - ',
      wrap: true,
      locale: 'vn',
      animate: false,
    };

    if (el.dataset.parent) {
      defaults.appendTo = document.querySelector(el.dataset.parent);
    }

    let options = extend({}, defaults, JSON.parse(el.getAttribute('data-options')));

    flatpickr(el, options);
  });
});


// --------------------------
// select2
// --------------------------

/* global extend */
$(document).ready(function() {
  'use strict';

  const elSwiper = document.querySelectorAll('[data-plugin="select2"]');
  Array.prototype.forEach.call(elSwiper, (el) => {
    let defaults = {
      minimumResultsForSearch: Infinity,
      // searchInputPlaceholder: 'Tìm kiếm',
      allowClear: true,
      dropdownParent: document.querySelector(el.dataset.parent),
      matcher: function (params, data) {
        if (jQuery.trim(params.term) === '') {
          return data;
        }
        var myTerm = jQuery.trim(params.term);
        if (data.text.toLowerCase().indexOf(myTerm.toLowerCase()) > -1) {
          return data;
        }
        return null;
        }
    };
    let options = extend({}, defaults, JSON.parse(el.getAttribute('data-options')));
    $(el).select2(options);
  });

  $(document).on('select2:open', () => {
    document.querySelector('input.select2-search__field').focus();
  });
});

(function($) {
  var Defaults = $.fn.select2.amd.require('select2/defaults');

  $.extend(Defaults.defaults, {
    searchInputPlaceholder: ''
  });

  var SearchDropdown = $.fn.select2.amd.require('select2/dropdown/search');
  var _renderSearchDropdown = SearchDropdown.prototype.render;

  SearchDropdown.prototype.render = function() {
    // invoke parent method
    var $rendered = _renderSearchDropdown.apply(this, Array.prototype.slice.apply(arguments));
    this.$search.attr('placeholder', this.options.get('searchInputPlaceholder'));
    return $rendered;
  };

})(window.jQuery);


// --------------------------
// choices
// --------------------------

/* global ready, extend, VirtualSelect */
ready(() => {
  'use strict';

  const elVirtualSelect = document.querySelectorAll('[data-plugin="virtual-select"]');
  Array.prototype.forEach.call(elVirtualSelect, (el) => {
    let defaults = {
      dropboxWrapper: 'body',
      hideClearButton: true,
      showDropboxAsPopup: false,
      search: false
    };
    let options = extend({}, defaults, JSON.parse(el.getAttribute('data-options')));

    VirtualSelect.init({ele: el, options});
  });
});
