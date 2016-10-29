Okapi
=====

_Proof of concept for a  tool for helping during development of Apigee Proxy bundles._

A reactive tool for handling common tasks during Apigee Proxy Bundles development.

## Okapi Server

Okapi server is nothing more than a proxy for Apigee Public API. It allows developers
to use OAuth tokens with or without MFA codes without the need of providing your credentials
on every call.

You can think of it as a Cookie Session keeper for curl calls.

Once the server is launched, its process will stay running until you stop it. You can
stop the server using okapi commands or invoking its `/stop-server` URL.

**Impotrtant!** Do not use Okapi server as a public server or in production environments.

## Why another Apigee bundle tool?

There are out there some mature and really good tools for handling Apigee bundles.
Unfortunately, none of them allows me to use them in other libraries as a way to generate bundles
in automated processes.

Also, I mainly maintain proxies that don't use NodeJS at all, but regular Apigee Edge policies.
And the two main CLI tools out there are special crafted to be used with Apigee NodeJS proxies.
 

## Dependencies

We try our best to keep Okapi at the minimum number of dependencies. At this point we use:

* **Jasmine** for testing. It is a development dependency not used at runtime.
* **RxJS** because almost everything in Okapy is a stream or it is converted into one.
* **jszip** is used to compress files and bundle them into ZIP files as they are expected by Apigee API. It is the same library used in the Proxy Editor in the Apigee UI.
* **morral** is a very small CLI helper tool with no additional dependencies.
