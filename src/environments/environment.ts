// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  hubUrl: "https://localhost:44374/updatehub",
  baseUrl: "https://localhost:44375",
  clientRoot: "http://localhost:4200/",
  stsAuthority: "https://myid-qa.siemens.com/",
  clientId: "2b9fd8ca-6124-4aa6-a834-e3ae0a0f05c7",
  tokenEndpoint: "https://myid-qa.siemens.com/as/token.oauth2",
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
