// 1. Foundation
// --------------------

Foundation.Interchange.SPECIAL_QUERIES['medium-retina'] = 'only screen and (min-width: 40em), (min-width: 40em) and (-webkit-min-device-pixel-ratio: 2), (min-width: 40em) and (min--moz-device-pixel-ratio: 2), (min-width: 40em) and (-o-min-device-pixel-ratio: 2/1), (min-width: 40em) and (min-device-pixel-ratio: 2), (min-width: 40em) and (min-resolution: 192dpi), (min-width: 40em) and (min-resolution: 2dppx)';
Foundation.Interchange.SPECIAL_QUERIES['large-retina'] = 'only screen and (min-width: 64em), (min-width: 64em) and (-webkit-min-device-pixel-ratio: 2), (min-width: 64em) and (min--moz-device-pixel-ratio: 2), (min-width: 64em) and (-o-min-device-pixel-ratio: 2/1), (min-width: 64em) and (min-device-pixel-ratio: 2), (min-width: 64em) and (min-resolution: 192dpi), (min-width: 64em) and (min-resolution: 2dppx)';
Foundation.Interchange.SPECIAL_QUERIES['xlarge-retina'] = 'only screen and (min-width: 75em), (min-width: 75em) and (-webkit-min-device-pixel-ratio: 2), (min-width: 75em) and (min--moz-device-pixel-ratio: 2), (min-width: 75em) and (-o-min-device-pixel-ratio: 2/1), (min-width: 75em) and (min-device-pixel-ratio: 2), (min-width: 75em) and (min-resolution: 192dpi), (min-width: 75em) and (min-resolution: 2dppx)';
Foundation.Interchange.SPECIAL_QUERIES['xxlarge-retina'] = 'only screen and (min-width: 90em), (min-width: 75em) and (-webkit-min-device-pixel-ratio: 2), (min-width: 75em) and (min--moz-device-pixel-ratio: 2), (min-width: 75em) and (-o-min-device-pixel-ratio: 2/1), (min-width: 75em) and (min-device-pixel-ratio: 2), (min-width: 75em) and (min-resolution: 192dpi), (min-width: 75em) and (min-resolution: 2dppx)';

$(document).foundation();

$('a[href*="#"]')
  // Remove links that don't actually link to anything
  .not('[href="#"]')
  .not('[href="#0"]')
  .click(function(event) {
    // On-page links
    if (
      location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '')
      &&
      location.hostname == this.hostname
    ) {
      // Figure out element to scroll to
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      // Does a scroll target exist?
      if (target.length) {
        // Only prevent default if animation is actually gonna happen
        event.preventDefault();
        $('html, body').animate({
          scrollTop: target.offset().top
        }, 1000, function() {
          // Callback after animation
          // Must change focus!
          var $target = $(target);
          $target.focus();
          if ($target.is(":focus")) { // Checking if the target was focused
            return false;
          } else {
            $target.attr('tabindex','-1'); // Adding tabindex for elements not focusable
            $target.focus(); // Set focus again
          };
        });
      }
    }
  });

// 2. Cookies Policy
// --------------------

$(function() {
  if($.cookie('showed_modal') != "true") {

setTimeout(
  function()
  {
    //do something special
$("#cookiesPolicy").foundation("open")
  }, 2000);

//     $("#cookiesPolicy").foundation("open");
//     $.cookie('showed_modal', 'true', { expires: 365, path: '/'});


    $.cookie('showed_modal', 'true', { expires: 365 });
  }
});

// 3. Map page
// --------------------

$(function(){
  var $map;
  var countries = {};

  function validInvolvement(text) {
    var validInvolvements = [
      'Standard',
      'Medium',
      'High',
      'Past engagement'
    ]
    return validInvolvements.includes(text);
  }

  function parseCountries() {
    var parsed = {};

    $('.country').each(function(index, country) {
      var $country = $(country);
      var $commitments = $country.find('.country_commitments');
      var $involvement = $country.find('.country_involvement');

      var iso2 = $country.attr('id');
      var name = $country.find('h2').first().text();
      var involvement = null;
      var commitments = $commitments.first().data('commitments') || [];
      var location = null;
      var infobox = $country.find('.callout').first()[0].outerHTML;

      var potentialInvolvement = $involvement.first().data('involvement');
      if(validInvolvement(potentialInvolvement)) {
        involvement = potentialInvolvement;
      }

      if(involvement) {
        location = $involvement.data('location').split(',');
      }

      parsed[iso2] = {
        iso2: iso2,
        name: name,
        involvement: involvement,
        commitments: commitments,
        commitmentLevel: commitmentLevel(commitments),
        location: location,
        infobox: infobox
      }
    });

    return parsed;
  };

  function countryMarkers() {
    return Object.keys(countries)
      .filter(function(iso2) { return countries[iso2].involvement })
      .map(function(iso2) {
        return {
          latLng: countries[iso2].location,
          name: countries[iso2].name,
          iso2: iso2
        };
      });
  };

  /**
   * @description determine if an array contains one or more items from another array.
   * @param {array} haystack the array to search.
   * @param {array} arr the array providing items to check for in the haystack.
   * @return {boolean} true|false if haystack contains at least one item from arr.
   */
  var findOne = function (haystack, arr) {
    return arr.some(function (v) {
      return haystack.indexOf(v) >= 0;
    });
  };

  function commitmentLevel(commitments) {
    var centralCommitments = [
      '2016 ACS: Central register',
      'OGP: Central register',
      'EU: All sectors',
      'EITI'
    ];
    var allSectorCommitments = [
      '2016 ACS: All sectors',
      'OGP: All sectors',
      'EU: All sectors',
    ];
    var publicCommitments = [
      '2016 ACS: Public register',
      'OGP: Public register',
      'EU: All sectors',
      'EITI'
    ];
    var otherCommitments = [
      'Other',
      'BOLG',
      'FSI'
    ];

    var score = 0;
    if(findOne(commitments, centralCommitments)) {
      score += 1;
    }
    if(findOne(commitments, allSectorCommitments)) {
      score += 1;
    }
    if(findOne(commitments, publicCommitments)) {
      score += 1;
    }

    // We map to a 0-1-2 scale, where you have to make 2/3 of central, public
    // and all sectors to get 1, or all three to get 2.
    var level = 0;
    if(score == 2) {
      level = 1;
    }
    if(score == 3) {
      level = 2;
    }
    return level;
  }

  function countryCommitmentLevels() {
    levels = {};
    $.each(countries, function(index, country) {
      levels[country.iso2] = country.commitmentLevel;
    });
    return levels;
  };

  function countryTooltip(country) {
    $tooltip = $(country.infobox);
    $tooltip.removeAttr('data-equalizer-watch').removeAttr('style').removeClass('large shadow');
    return $tooltip[0].outerHTML;
  };

  countries = parseCountries();

  $map = $('.world-map').vectorMap({
    map: 'world_merc',
    zoomOnScroll: false,
    panOnDrag: false,
    backgroundColor: '#fefefe',
    regionStyle: {
      initial: {
        fill: '#DCDCDC',
        stroke: '#fefefe',
        'stroke-width': 1
      }
    },
    markerStyle: {
      initial: {
        fill: '#B20F47',
        stroke: '#fefefe',
        'stroke-width': 1
      }
    },
    markers: countryMarkers(),
    series: {
      regions: [
        {
          values: countryCommitmentLevels(),
          attribute: 'fill',
          scale: ['#DCDCDC', '#3596f2', '#31408c'],
          min: 0,
          max: 2
        }
      ],
    },
    // Disable jvectormap tooltips, we'll use our own library for them
    onRegionTipShow: function(e) { e.preventDefault() },
    onMarkerTipShow: function(e) { e.preventDefault() },
  });

  var map = $map.vectorMap('get', 'mapObject');

  // Markers are not indexed by country code, so build our own index of
  // iso code -> dom node for ease of initialising tooltips
  var markerNodes = {}
  $.each(map.markers, function(index, marker) {
    markerNodes[marker.config.iso2] = marker.element.shape.node;
  });

  $.each(countries, function(index, country) {
    var region = map.regions[country.iso2];
    var markerNode = markerNodes[country.iso2];
    if(region) {
      tippy(region.element.shape.node, {
        theme: 'light',
        content: countryTooltip(country),
        allowHTML: true
      });
    }
    if(markerNode) {
      tippy(markerNode, {
        theme: 'light',
        content: countryTooltip(country),
        allowHTML: true
      });
    }
  });
});
