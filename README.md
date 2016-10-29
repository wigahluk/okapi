Okapi
=====

_Proof of concept for a  tool for helping during development of Apigee Proxy bundles._

A reactive tool for handling common tasks during Apigee Proxy Bundles development.

## Usage

Install it with NPM:

```bash
$ npm install okapipack
```

Configuration file is named `okapi.json` by default and its minimum setup is:

```
{
  "name": "apiproxy",                  // Your Proxy name. This will be used when genearting calls 
                                       // against the Apigee API
  "bundleType": "apiproxy",            // Right now the only possible value is "apiproxy"
  "sourcePath": "./src",               // Path for the source of your proxy files 
  "buildPath": "./build",              // Path hwere the generated bundle will be created
  "defaultOrg": <String>,              // Organization name used as default if none is provided
                                       // to specific commands
  "defaultEnvironment": <String>,      // Envirnment name used as default if none is provided 
                                       // to specific commands
  "server": {
    "port": 8989,                                  // Okapi server port
    "ssoEndpoint": "login.apigee.com",             // SSO Endpoint
    "apigeeEndpoint": "api.enterprise.apigee.com", // Apigee API Endpoint
    "basePath": "/v1"                              // Apigee API Basepath
  }
}
```
If no configuration is provided, all values will take its default values which
are the ones shown in the example above.

### Available commands

* `--conf <path>` Path to configuration file if you don't want to use the default name and path.
* `-l` `--upload` `[-o <organization>]` Build and upload the bundled proxy. It will not emit any file in the local file system.
* `-d` `--deploy` `<revision>` `[-o <organization> -e <environment>]` Deploy the specific revision of the current proxy in the given environment in the given org.
* `-b` `--build` Emits a bundle file (ZIP) for the proxy.
* `--start` Start the Okapi Server.
* `--stop` Stop the Okapi Server.
* `--status` Return the current status of the Okapi Server.
* `--auth` `-u <user> -p <password> -m <MFA code>` Authenticate the Okapi Server.

### Folder conventions

Okapi assumes that the folder configured as the path for your source code reflects the structure of an Apigee Bundle:

```
src/
├── proxies/                            // Proxy Endpoints
├── targets/                            // Target Endpoints
├── policies/                           // Policies
├── resources/                          // Resource scripts or JARs
└── proxy.xml                           // The metadata file for your proxyy point
```

### Building and uploading a proxy

One common use case is to generate a bundle and upload it immediately to your org. Often you don't need the 
generated file, instead you just need to upload it to your org. You can use the following command to do this:
 
```bash
$ okapi -l -o <your_org_name>
```

If you have specified a default org in your `okapi.json` file, the org parameter is optional and okapi
will you your default org.

This command requires the **Okapi Server** to be running and authenticated.

### Deploying a proxy

You can deploy any revision to any environment and org you have access. usually you do this after uploading
a bundle to your org.
 
```bash
$ okapi -d -o <your_org_name> -e <environment>
```

If you have specified a default org and environment in your `okapi.json` file you don't need to specify them
again in the deploy command. If you want to use a different org or environment,
you can override them in the command.

This command requires the **Okapi Server** to be running and authenticated.

### Generating a bundle

If you need to generate a ZIP file with your bundle to store it or send it, you can generate the bundle file
with Okapi.

After you have created your configuration file, you can use:

```bash
$ okapi -b
```
Generating bundles locally doesn't require the **Okapi Server**.

## Okapi Server

**Okapi Server** is nothing more than a proxy for Apigee Public API. It allows developers
to use OAuth tokens with or without MFA codes without the need of providing your credentials
on every call.

You can think of it as a Cookie Session keeper for curl calls.

At this point only paths as `/organizations/...` are supported by **Okapi Server**. 

Once the server is launched, its process will stay running until you stop it. You can
stop the server using okapi commands or invoking its `/stop-server` URL.

**Impotrtant!** Do not use Okapi Server as a public server or in production environments.

## Why another Apigee bundle tool?

There are out there some mature and really good tools for handling Apigee bundles.
Unfortunately, none of them allows me to use them in other libraries as a way to generate bundles
in automated processes.

Also, I mainly maintain proxies that don't use NodeJS at all, but regular Apigee Edge policies.
And the two main CLI tools out there are specially crafted to be used with Apigee NodeJS proxies.

I'm creating this tool looking at my personal use cases but I hope it will fit 
other's as well.
 

## Dependencies

We try our best to keep Okapi at the minimum number of dependencies. At this point we use:

* **Jasmine** for testing. It is a development dependency not used at runtime.
* **RxJS** because almost everything in Okapy is a stream or it is converted into one.
* **jszip** is used to compress files and bundle them into ZIP files as they are expected by Apigee API. It is the same library used in the Proxy Editor in the Apigee UI.
* **morral** is a very small CLI helper tool with no additional dependencies.
