import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'ecommerce',
  clientId: 'shop-fe',
});

export default keycloak;