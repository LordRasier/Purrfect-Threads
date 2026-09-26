import type { AccountState } from '../platform/account';
import { translate as tr } from './localization';

export const unavailableAccount: AccountState = { status: 'unavailable', pending: false, notice: null };
export function accountPresentation(state: AccountState) {
  const messages = {
    unavailable: 'Account connection is unavailable in this build.',
    'signed-out': 'No account connected on this device.',
    'signed-in': 'Google account connected. Purchases are still unavailable.',
    busy: 'A previous account request is finishing. Check status again shortly.',
  };
  const notices = {
    cancelled: 'Connection cancelled. You can try again whenever you are ready.',
    failed: 'The account request failed. Check your connection and try again.',
    'clear-failed': 'Disconnected from Firebase. Google account selection could not be reset; try disconnecting again after reconnecting.',
  };
  return {
    message: tr(state.pending ? 'Working on your account request…' : state.notice ? notices[state.notice] : messages[state.status]),
    label: tr(state.pending ? 'Please wait…' : state.status === 'signed-in' ? 'Disconnect' : state.status === 'unavailable' || state.status === 'busy' ? 'Unavailable' : 'Connect with Google'),
    disabled: state.pending || state.status === 'unavailable' || state.status === 'busy',
    action: state.status === 'signed-in' ? 'account-disconnect' : 'account-connect',
    refresh: state.status === 'busy' || state.notice === 'failed',
  };
}
export function accountCard(state = unavailableAccount): string {
  const view = accountPresentation(state);
  return `<section class="account-card" aria-labelledby="account-title" data-account-card>
    <h2 id="account-title" class="eyebrow">${tr('ACCOUNT')}</h2>
    <p id="account-disclosure">${tr('Google/Firebase processes account identifiers to prepare purchase linking. Saved games are not synced. Purchases are unavailable in this alpha.')}</p>
    <p id="account-status" role="status" aria-live="polite">${view.message}</p>
    <div class="account-actions"><button id="account-action" class="soft-button" data-action="${view.action}" aria-describedby="account-disclosure account-status" ${view.disabled ? 'disabled' : ''}>${view.label}</button>
    <button id="account-refresh" class="soft-button" data-action="account-refresh" ${view.refresh ? '' : 'hidden'} ${state.pending ? 'disabled' : ''}>${tr('Check account status')}</button></div>
    <p class="account-note">${tr('Disconnecting signs out on this device; it does not delete your account.')}</p>
  </section>`;
}
/** Update existing controls instead of replacing focused buttons or the live region. */
export function updateAccountCard(root: HTMLElement, state: AccountState): void {
  const card = root.querySelector<HTMLElement>('[data-account-card]');
  if (!card) return;
  const view = accountPresentation(state);
  card.querySelector('#account-status')!.textContent = view.message;
  const action = card.querySelector<HTMLButtonElement>('#account-action')!;
  action.textContent = view.label; action.disabled = view.disabled; action.dataset.action = view.action;
  const refresh = card.querySelector<HTMLButtonElement>('#account-refresh')!;
  refresh.hidden = !view.refresh; refresh.disabled = state.pending;
}
