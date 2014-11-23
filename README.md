pirate-curl
===========

cross-domain requesting pages, like a pirate sails the seas

###whitelist.txt
Fill whitelist.txt with ip-addresses, one ip-address per line, that are allowed to query the server. The current version is sadly very basic in how it handles ip-addresses, i.e. no support for ranges, or simply allowing all requests. Easily fixed if you care about that kind of thing, though.

###usage:
```
POST
  url: <host_of_pirate-curl> + '/curl4me'
  data: {url: <your_url_here>}

returns page contents of <your_url_here> as {result: <contents>}
```
