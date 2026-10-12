# Local security patch

This is `http-cache-semantics` 4.2.0, vendored from the npm release and patched
to prevent `max-stale` from reusing responses whose freshness lifetime is zeroed
to prohibit reuse (`Set-Cookie` or `proxy-revalidate` in shared caches,
`no-cache`, or `Vary: *`).

The upstream fix is tracked at
https://github.com/kornelski/http-cache-semantics/issues/56. Replace this local
override with a fixed upstream release once one is available.
