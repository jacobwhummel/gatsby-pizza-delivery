import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { AnchorLink } from 'gatsby-plugin-anchor-links';
import PropTypes from 'prop-types';
import tw from 'twin.macro';
import styled from '@emotion/styled';
import { useCart } from '../utils/useCart';
import ItemControls from './ItemControls';

const CartItem = styled.div`
  font-family: 'Montserrat';
  ${tw`flex items-center text-black uppercase font-semibold p-3 border-b border-black`}
`;

const CartItemTitle = styled.div`
  ${tw`pr-2`}
  flex: 1;
`;

const CartFooter = styled.div`
  ${tw`flex justify-between p-4`}
`;

const CartButton = styled((p) => (
  <AnchorLink {...p} />
))`
  ${tw`rounded-full px-4 py-1 text-white`}
  background-color: #D45D27;
`;

const getPizzaData = (sku, pizzas) => pizzas.nodes.find((p) => p.fields.sku === sku).frontmatter;
const priceTotal = (items, pizzas, deliveryPrice) => items.reduce(
  (total, onePizza) => total + (getPizzaData(onePizza.sku, pizzas).price * onePizza.quantity),
  deliveryPrice,
);
const convertPriceToEUR = (price, rate) => (rate ? (price * rate).toFixed(2) : 'N/A');

const Cart = ({ exchangeRate, hideFooter }) => {
  const data = useStaticQuery(
    graphql`
      query {
        allMdx {
          nodes {
            fields {
              sku
            }
            frontmatter {
              title
              price
            }
          }
        }
      }
    `,
  );
  const {
    items, removeLineItem, clearCart, lineItemsCount, itemsCount,
  } = useCart();
  const pizzas = data.allMdx;
  const deliveryPriceInUSD = 5;
  const priceTotalInUSD = priceTotal(items, pizzas, deliveryPriceInUSD);
  if (items.length > 0) {
    return (
      <div>
        {items.map((item) => {
          const pizzaData = getPizzaData(item.sku, pizzas);
          return (
            <CartItem key={item.sku}>
              <CartItemTitle>
                {pizzaData.title}
              </CartItemTitle>
              $
              {pizzaData.price * item.quantity}
              /
              {convertPriceToEUR((pizzaData.price * item.quantity), exchangeRate)}
              €
              <ItemControls
                sku={item.sku}
              />
              <button type="button" onClick={() => removeLineItem(item.sku)}>
                X
              </button>
            </CartItem>
          );
        })}
        {lineItemsCount > 0 && (
        <CartItem>
          <CartItemTitle>delivery costs:</CartItemTitle>
          $
          {deliveryPriceInUSD}
          /
          {convertPriceToEUR(deliveryPriceInUSD, exchangeRate)}
          €
        </CartItem>
        )}
        <CartItem>
          <CartItemTitle>
            Total:
            {' '}
            {itemsCount}
          </CartItemTitle>
          $
          {priceTotalInUSD}
          /
          {convertPriceToEUR(priceTotalInUSD, exchangeRate)}
          €
        </CartItem>
        {!hideFooter && (
          <CartFooter>
            <button type="button" onClick={clearCart}>Clear Cart</button>
            <CartButton to="/order#order-review">Submit Order</CartButton>
          </CartFooter>
        )}
      </div>
    );
  }
  return (<div>empty cart</div>);
};

Cart.propTypes = {
  exchangeRate: PropTypes.number.isRequired,
  hideFooter: PropTypes.bool,
};

Cart.defaultProps = {
  hideFooter: false,
};

export default Cart;