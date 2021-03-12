import React, { useEffect, useRef, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { getAccountBalance } from "@shared/api/internal";

import { emitMetric } from "helpers/metrics";
import {
  accountNameSelector,
  allAccountsSelector,
  publicKeySelector,
} from "popup/ducks/authServices";

import { COLOR_PALETTE } from "popup/constants/styles";
import { POPUP_WIDTH } from "constants/dimensions";
import { ROUTES } from "popup/constants/routes";

import { METRIC_NAMES } from "popup/constants/metricsNames";

import { BasicButton } from "popup/basics/Buttons";

import { Header } from "popup/components/Header";
import { AccountAssets } from "popup/components/account/AccountAssets";
import { AccountDropdown } from "popup/components/account/AccountDropdown";
import { NotFundedMessage } from "popup/components/account/NotFundedMessage";
import { Toast } from "popup/components/Toast";
import { Menu } from "popup/components/Menu";

import CopyColorIcon from "popup/assets/copy-color.svg";
import QrCode from "popup/assets/qr-code.png";

import "popup/metrics/authServices";

const AccountEl = styled.div`
  width: 100%;
  max-width: ${POPUP_WIDTH}px;
  box-sizing: border-box;
  padding: 1.75rem 1rem;
`;

const AccountHeaderEl = styled.div`
  align-items: center;
  background: ${COLOR_PALETTE.white};
  display: flex;
  font-size: 0.81rem;
  justify-content: space-between;
  padding: 0 1rem;
`;

const CopyButtonEl = styled(BasicButton)`
  color: ${COLOR_PALETTE.primary};
  display: flex;
  padding: 0;

  img {
    margin-right: 0.5rem;
    width: 1rem;
    height: 1rem;
  }
`;

const QrButton = styled(BasicButton)`
  background: url(${QrCode});
  background-size: cover;
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
  vertical-align: text-top;
`;

const VerticalCenterLink = styled(Link)`
  vertical-align: middle;
`;

const AccountDetailsEl = styled.section`
  padding-bottom: 6rem;
`;

const CopiedToastWrapperEl = styled.div`
  margin: 5rem 0 0 -2rem;
  position: absolute;
  right: 15rem;
`;

export const Account = () => {
  const [accountBalance, setaccountBalance] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAccountFunded, setIsAccountFunded] = useState(true);
  const publicKey = useSelector(publicKeySelector);
  const allAccounts = useSelector(allAccountsSelector);
  const currentAccountName = useSelector(accountNameSelector);
  const accountDropDownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let res = { balance: "", isFunded: true };
    const fetchAccountBalance = async () => {
      try {
        res = await getAccountBalance(publicKey);
      } catch (e) {
        console.error(e);
      }
      const { balance, isFunded } = res;
      setaccountBalance(balance);
      setIsAccountFunded(isFunded);
    };
    fetchAccountBalance();
  }, [publicKey]);

  const closeDropdown = (e: React.ChangeEvent<any>) => {
    if (
      accountDropDownRef.current &&
      !accountDropDownRef.current.contains(e.target)
    ) {
      setIsDropdownOpen(false);
    }
  };

  return accountBalance ? (
    <section onClick={closeDropdown}>
      <Header>
        <Menu />
      </Header>
      <AccountHeaderEl>
        <AccountDropdown
          accountDropDownRef={accountDropDownRef}
          allAccounts={allAccounts}
          currentAccountName={currentAccountName}
          isDropdownOpen={isDropdownOpen}
          setIsDropdownOpen={setIsDropdownOpen}
          publicKey={publicKey}
        />
        <CopyToClipboard
          text={publicKey}
          onCopy={() => {
            setIsCopied(true);
            emitMetric(METRIC_NAMES.copyPublickKey);
          }}
        >
          <CopyButtonEl>
            <img src={CopyColorIcon} alt="copy button" /> Copy
          </CopyButtonEl>
        </CopyToClipboard>
        <CopiedToastWrapperEl>
          <Toast
            message="Copied to your clipboard 👌"
            isShowing={isCopied}
            setIsShowing={setIsCopied}
          />
        </CopiedToastWrapperEl>
        <VerticalCenterLink to={ROUTES.viewPublicKey}>
          <QrButton /> Details
        </VerticalCenterLink>
      </AccountHeaderEl>
      <AccountEl>
        <AccountDetailsEl>
          {isAccountFunded ? (
            <AccountAssets accountBalance={accountBalance} />
          ) : (
            <NotFundedMessage />
          )}
        </AccountDetailsEl>
      </AccountEl>
    </section>
  ) : null;
};
