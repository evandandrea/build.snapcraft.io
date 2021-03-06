# Routes

## Launchpad snap management

Unless otherwise stated, routes return JSON responses of this form:

    {"status": "...", "payload": {"code": "...", "message": "..."}}

`status` may be `success` or `error`.

To create a snap:

    POST /api/launchpad/snaps
    Cookie: <session cookie>
    Content-Type: application/json
    Accept: application/json

    {
      "repository_url": "https://github.com/:owner/:name"
    }

On success, returns:

    HTTP/1.1 201 OK
    Content-Type: application/json

    {
      "status": "success",
      "payload": {
        "code": "snap-created",
        "message": ":caveat-id"
      }
    }

Once the caller has registered the snap name with the store, it should
acquire a pre-authorized macaroon from the store (on the authority of a
`package_upload_request` macaroon which has itself been authorized using
OpenID) and tell Launchpad to use that for uploads along with telling it the
snap name, series, and channels.  This can be done using this API method:

    POST /api/launchpad/snaps/authorize
    Cookie: <session cookie>
    Content-Type: application/json

    {
      "repository_url": "https://github.com/:owner/:name",
      "snap_name": ":snap-name",
      "series": ":series",
      "channels": [":channel", ...],
      "macaroon": ":macaroon"
    }

On success, returns:

    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "status": "success",
      "payload": {
        "code": "snap-authorized",
        "message": "Snap uploads authorized"
      }
    }

To search for an existing snap:

    GET /api/launchpad/snaps?repository_url=:url
    Accept: application/json

Successful responses have `status` set to `success` and `code` set to
`snap-found`; the `snap` will be the snap data from Launchpad API.

To search for snap builds:

    GET /api/launchpad/builds?snap_link=:snap
    Accept: application/json

On success, returns the following, where the items in `builds` are
[snap\_build entries](https://launchpad.net/+apidoc/devel.html#snap_build)
as returned by the Launchpad API:

    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "status": "success",
      "payload": {
        "code": "snap-builds-found",
        "builds": [
          ...
        ]
      }
    }

To request builds of an existing snap:

    POST /api/launchpad/snaps/request-builds
    Cookie: <session cookie>
    Content-Type: application/json
    Accept: application/json

    {
      "repository_url": "https://github.com/:owner/:name"
    }

On success, returns the following, where the items in `builds` are
[snap\_build entries](https://launchpad.net/+apidoc/devel.html#snap_build)
as returned by the Launchpad API:

    HTTP/1.1 201 Created
    Content-Type: application/json

    {
      "status": "success",
      "payload": {
        "code": "snap-builds-requested",
        "builds": [
          ...
        ]
      }
    }

To delete a snap:

    POST /api/launchpad/snaps/delete
    Cookie: <session cookie>
    Content-Type: application/json
    Accept: application/json

    {
      "repository_url": "https://github.com/:owner/:name"
    }

On success, returns:

    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "status": "success",
      "payload": {
        "code": "snap-deleted",
        "message": "Snap deleted"
      }
    }

## GitHub

### GitHub auth

TODO

### GitHub webhook

TODO

### Listing GitHub repositories

To get a list of repositories for current user (user needs to be authorised to GH before) use:

    GET /api/github/repos
    Cookie: <session cookie>
    Accept: application/json

    GET /api/github/repos/page/1
    Cookie: <session cookie>
    Accept: application/json

On success, returns the following where the items in `repos` are GitHub repositories as returned by [GitHub API](https://developer.github.com/v3/repos/#list-your-repositories). Pagination parameter is optional. `pageLinks` for first, previous, next and last pages are supplied if results are paginated by the GitHub API. This happens when more than 30 repositories are returned.

Each repository is supplemented with a `snap_info` object which contains the
snap name, if any.

    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "status": "success",
      "payload": {
        "code": "github-list-repositories",
        "repos": [
          {
            "full_name": "anowner/aname",
            "name": "aname",
            "owner": {
              "login":"anowner"
              ...
            }
            ...
          }
        ]
      },
      "pageLinks": {
        "first": 1,
        "prev": 1,
        "next": 3,
        "last": 3
      },
      "snap_info": {
        "name": "snap-name"
      }
    }

### Getting snapcraft.yaml

To get a parsed version of the `snapcraft.yaml` file in a GitHub repository:

    GET /api/github/snapcraft-yaml/:owner/:name
    Cookie: <session cookie>
    Accept: application/json

On success, returns the following, where `contents` is a JSON representation
of the parsed YAML file:

    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "status": "success",
      "payload": {
        "code": "github-snapcraft-yaml-found",
        "contents": {
          "name": ":snap-name",
          ...
        }
      }
    }

## Store

### Snap name registration

To register a name with the store:

    POST /api/store/register-name
    Content-Type: application/json

    {
      "snap_name": ":snap-name",
      "root": ":package-upload-request-macaroon",
      "discharge": ":sso-discharge-macaroon"
    }

The response is [defined by the
store](https://myapps.developer.ubuntu.com/docs/api/snap.html#register-a-package-name).

This endpoint should be considered temporary; once it is possible to make a
cross-origin request directly to the store, we will do that instead.
