$(function() {
  var client = ShopifyBuy.buildClient({
    apiKey: '91d9b09d1042009110e3260f838f0bde',
    myShopifyDomain: 'goodyearsldn',
    appId: '6'
  });

  var cart;
  var cartLineItemCount;
  if(localStorage.getItem('lastCartId')) {
    client.fetchCart(localStorage.getItem('lastCartId')).then(function(remoteCart) {
      cart = remoteCart;
      cartLineItemCount = cart.lineItems.length;
      renderCartItems();
    });
  } else {
    client.createCart().then(function (newCart) {
      cart = newCart;
      localStorage.setItem('lastCartId', cart.id);
      cartLineItemCount = 0;
      $('.headerCart__count').html(0);
    });
  }


  var ids = [];
  var selectedVariants = [];

  $('.buy-button').each(function(){
    var id = $(this).attr('data-id');
    ids.push(id);
  }).promise().done( function(){
    client.fetchQueryProducts({products_ids: ids}).then(function (products) {
      for(var index in products) {
        var product = {
          id: products[index].id,
          selectedVariant: products[index].selectedVariant,
          selectedVariantImage: products[index].selectedVariantImage,
          currentOptions: products[index].options
        }

        selectedVariants.push(products[index].selectedVariant);

        var variantSelectors = generateSelectors(products[index]);
        $('.variant-selectors').html(variantSelectors);

        // updateProductTitle(products[index].title);
        // updateVariantTitle(selectedVariant);
        // updateVariantPrice(selectedVariant);
        attachBuyButtonListeners(products[index]);
        attachOnVariantSelectListeners(products[index]);
        // updateCartTabButton();
        // attachCheckoutButtonListeners();
      }
    });
    attachQuantityIncrementListeners();
    attachQuantityDecrementListeners();
    attachCheckoutButtonListeners();
  });

  function updateCartCount(lineItems) {
    var total = 0;
    for(var i = 0; i < lineItems.length; i++) {
      var qty = lineItems[i].quantity;
      total += qty;
    }
    $('.headerCart__count').html(total);
  }

  /* Generate DOM elements for variant selectors
  ============================================================ */
  function generateSelectors(product) {
    var elements = product.options.map(function(option) {
      return '<select name="' + option.name + '" class="genSel">' + option.values.map(function(value) {
        return '<option value="' + value + '">' + value + '</option>';
      }) + '</select>';
    });

    return elements;
  }

  /* Render the line items currently in the cart */
  function renderCartItems() {
    var $cartItemContainer = $('.cart-item-container');
    var totalPrice = 0;

    $cartItemContainer.empty();
    var lineItemEmptyTemplate = $('#cart-item-template').html();
    var img = $('.releaseArtwork img').attr('src');
    var $cartLineItems = cart.lineItems.map(function (lineItem, index) {
      var $lineItemTemplate = $(lineItemEmptyTemplate);
      var img = lineItem.image.src;
      $lineItemTemplate.find('.cart-item__title').text(lineItem.title);
      $lineItemTemplate.find('.cart-item__img').html('<img src="'+img+'"/>');
      $lineItemTemplate.find('.cart-item__variant-title').text(lineItem.variant_title);
      $lineItemTemplate.find('.cart-item__price').text(formatAsMoney(lineItem.line_price));
      $lineItemTemplate.find('.cart-item__quantity').attr('value', lineItem.quantity);
      $lineItemTemplate.find('.quantity-decrement').attr('data-variant-id', lineItem.variant_id);
      $lineItemTemplate.find('.quantity-increment').attr('data-variant-id', lineItem.variant_id);

      if (cartLineItemCount < cart.lineItems.length && (index === cart.lineItems.length - 1)) {
        $lineItemTemplate.addClass('js-hidden');
        cartLineItemCount = cart.lineItems.length;
      }

      if (cartLineItemCount > cart.lineItems.length) {
        cartLineItemCount = cart.lineItems.length;
      }

      return $lineItemTemplate;
    });
    $cartItemContainer.append($cartLineItems);

    setTimeout(function () {
      $cartItemContainer.find('.js-hidden').removeClass('js-hidden');
    }, 0)

    $('.cart .pricing').text(formatAsMoney(cart.subtotal));
    updateCartCount(cart.lineItems);
  }

  /* Variant option change handler
============================================================ */
function attachOnVariantSelectListeners(product) {
  $('.variant-selectors').on('change', 'select', function(event) {
    var $element = $(event.target);
    var name = $element.attr('name');
    var value = $element.val();
    product.options.filter(function(option) {
      return option.name === name;
    })[0].selected = value;

    var selectedVariant = product.selectedVariant;
    var selectedVariantImage = product.selectedVariantImage;
    updateProductTitle(product.title);
    updateVariantImage(selectedVariantImage);
    updateVariantTitle(selectedVariant);
    updateVariantPrice(selectedVariant);
  });
}


  /* Update product title
  ============================================================ */
  function updateProductTitle(title) {
    $('#buy-button-1 .product-title').text(title);
  }

    /* Update product variant title based on selected variant
    ============================================================ */
    function updateVariantTitle(variant) {
      $('#buy-button-1 .variant-title').text(variant.title);
    }

    /* Update product variant price based on selected variant
    ============================================================ */
    function updateVariantPrice(variant) {
      $('#buy-button-1 .variant-price').text('$' + variant.price);
    }

  /* Format amount as currency
  ============================================================ */
  function formatAsMoney(amount) {
    return '£' + parseFloat(amount, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString();
  }

    /* Checkout listener
  ============================================================ */
  function attachCheckoutButtonListeners() {
    $('.btn--cart-checkout').on('click', function () {
      window.open(cart.checkoutUrl, 'Good Years Checkout', 'width=400,height=500');
    });
  }

  /* Update cart tab button
  ============================================================ */
  function updateCartTabButton() {
    if (cart.lineItems.length > 0) {
      var totalItems = cart.lineItems.reduce(function(total, item) {
        return total + item.quantity;
      }, 0);
      $('.btn--cart-tab .btn__counter').html(totalItems);
      $('.btn--cart-tab').addClass('js-active');
    } else {
      $('.btn--cart-tab').removeClass('js-active');
      $('.cart').removeClass('js-active');
    }

    $('.btn--cart-tab').click(function() {
      openCart();
    });
  }

  /* Open Cart
  ============================================================ */
  function openCart() {
    $('.cart').addClass('js-active');
  }

  /* Close Cart
  ============================================================ */
  function closeCart() {
    $('.cart .btn--close').click(function () {
      $('.cart').removeClass('js-active');
    });
  }


  // client.createCart().then(function (newCart) {
  //   cart = newCart;
  //   localStorage.setItem('lastCartId', cart.id);
  //   cartLineItemCount = 0;
  // });

  /* Add 'quantity' amount of product 'variant' to cart
  ============================================================ */
  function addVariantToCart(variant, quantity) {
    openCart();
    cart.addVariants({ variant: variant, quantity: quantity }).then(function() {
      renderCartItems();
    }).catch(function (errors) {
      console.log('Fail');
      console.error(errors);
    });

    updateCartTabButton();
  }


    /* Increase product variant quantity in cart
    ============================================================ */
    function attachQuantityIncrementListeners() {
      $('.cart').on('click', '.quantity-increment', function() {
        var variantId = parseInt($(this).attr('data-variant-id'), 10);
        var variant = selectedVariants.filter(function (variant) {
          return (variant.id === variantId);
        })[0];

        $(this).closest('.cart-item').addClass('js-working');
        $(this).attr('disabled', 'disabled');
        addVariantToCart(variant, 1);
      });
    }

    /* Decrease product variant quantity in cart
    ============================================================ */
    function attachQuantityDecrementListeners() {
      $('.cart').on('click', '.quantity-decrement', function() {
        var variantId = parseInt($(this).attr('data-variant-id'), 10);
        var variant = selectedVariants.filter(function (variant) {
          console.log(variant.id, variantId)
          return (variant.id === variantId);
        })[0];

        $(this).closest('.cart-item').addClass('js-working');
        $(this).attr('disabled', 'disabled');

        addVariantToCart(variant, -1);
      });
    }

    /* Update product variant title based on selected variant
  ============================================================ */
  function updateVariantTitle(variant) {
    $('#buy-button-1 .variant-title').text(variant.title);
  }

  /* Update product variant price based on selected variant
  ============================================================ */
  function updateVariantPrice(variant) {
    $('#buy-button-1 .variant-price').text('$' + variant.price);
  }


  /* Attach and control listeners onto buy button
  ============================================================
  ============================================================
  ============================================================
  ============================================================ */
  function attachBuyButtonListeners(product) {
    var el = document.getElementById(product.id);
    $(el).on('click', function (event) {
      event.preventDefault();
      var id = product.selectedVariant.id;
      addVariantToCart(product.selectedVariant, 1);
    });
  }

  $('.btn--close span').on('click', function (event) {
    closeCart();
  });

  $('.headerCart__link').on('click', function (event) {
    event.preventDefault();
    openCart();
  });
});
