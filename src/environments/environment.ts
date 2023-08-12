// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  firebase: {
    apiKey: "AIzaSyBLyZ2vINde9aR02Nz2K9-C7azS07XNQrY",
    authDomain: "martin-triana.firebaseapp.com",
    projectId: "martin-triana",
    storageBucket: "martin-triana.appspot.com",
    messagingSenderId: "948199877630",
    appId: "1:948199877630:web:75533a1fcbcc43c705eeaf"
  },
  production: false,
  backendUrl: 'https://api.origenecommerce.com.co:5401',
  publicKeyWompi: 'pub_test_0G9zOCcwRsjf3qnL9CHpCvPFc10iQC2H',
  redirectUrlEcommerce: 'http://localhost:4200/dashboard/mis-pedidos'
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
