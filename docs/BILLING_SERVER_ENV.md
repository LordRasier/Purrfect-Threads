# Prepare the billing server environment

**Keep billing disabled.** Add the following two lines to the existing environment
file loaded by the Auraliax `server/leaderboard` service. Its deployed filesystem
path has not been inspected; do not create a second unused `.env` or replace the
existing file. Update existing entries instead of duplicating them.

```dotenv
PURRFECT_BILLING_ENABLED=false
PURRFECT_FIREBASE_APP_ID=1:293396971360:android:97753a705bcf38e7ee6805
```

This Firebase app belongs to `com.rasie.purrfectthreads` in
`platform-pulse-lordrasier` (project number `293396971360`). It is not the
`com.rasie.platformpulse` app ID. The Google Play Integrity link and Firebase
App Check registration were verified in the consoles on 2026-09-26.

## Remaining values, before activation

The backend loader also requires these four values when billing is enabled:

| Variable | Value |
| --- | --- |
| `PURRFECT_BILLING_ACCOUNT_SECRET` | Independently generated stable random secret; at least 32 characters. |
| `PURRFECT_BILLING_TOKEN_KEY` | Exactly 32 random bytes encoded as canonical base64. |
| `PURRFECT_PLAY_AUTH_MODE` | `keyfile` for a dedicated Play service account. |
| `PURRFECT_PLAY_CREDENTIALS_FILE` | Actual absolute server path of that service account's private JSON. |

Do not use `google-services.json` as the credentials file: it is Android client
configuration, not a server service-account key. Do not change the existing
`GOOGLE_APPLICATION_CREDENTIALS`, `UID_HMAC_SECRET`, or database settings used by
Jumper Jack. A new file path alone does not create credentials or Play permissions.

The dedicated account still needs the Google Play Android Developer API enabled
and Google Play Console access scoped **only to Purrfect Threads**. Google's
[server-to-server setup guide](https://developers.google.com/android-publisher/getting_started#use_a_service_account)
lists purchase permissions as viewing financial/order data and managing
orders/subscriptions. Do not grant project-wide Owner/Editor roles as a shortcut.
Creating the credential and granting access require the owner's confirmation;
the private JSON must be transferred to the server by the operator, not committed
to either repository. The existing Play Integrity link does not grant purchase
verification access.

### Generate secrets once, on the server

The operator can run the following with the existing Node runtime. It writes a
new restricted file in the current user's home directory, never prints secrets,
and refuses to overwrite an existing file. The agent has **not** run it on the
server. The script is for a POSIX server; keep the file outside the checkout and
use the service operator's account.

```sh
node --input-type=module <<'NODE'
import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const file = join(homedir(), '.purrfect-billing-secrets.env');
const content = [
  `PURRFECT_BILLING_ACCOUNT_SECRET=${randomBytes(32).toString('hex')}`,
  `PURRFECT_BILLING_TOKEN_KEY=${randomBytes(32).toString('base64')}`,
  '',
].join('\n');
writeFileSync(file, content, { flag: 'wx', mode: 0o600 });
console.log('Created private billing secret fragment; existing files were not overwritten.');
NODE
```

Transfer the two values into the service's existing environment using your secure
server editor; do not paste them into chat or commit them. Preserve an encrypted
backup. Never regenerate these values after purchases exist: one binds purchase
ownership and the other decrypts stored purchase tokens.

## Activation gate

Leave `PURRFECT_BILLING_ENABLED=false` until native identity/App Check/Billing,
the dedicated Play service account and app-scoped permissions, product pricing,
privacy disclosures, migration, and license-tester verification are complete.
The Google Play product is `meowtastic_crew_12h`; USD 2.00 is its intended base
price, not a hardcoded charge or a server environment variable.

Use `server/leaderboard/PURRFECT_BILLING.md` in the
`LordRasier/platform-pulse-leaderboard` repository for the API contract, migration,
and full closed-test gates. This file does not claim a deployed or working
end-to-end purchase flow.
