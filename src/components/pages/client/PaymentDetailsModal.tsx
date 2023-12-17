"use client";
import React, { ReactNode } from "react";
import { Button } from "@/components/shadcn/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/dialog";
import useSubmit from "@/hooks/useSubmit";
import {
  usePaypalSubscription,
  useStripeSubscription,
  useUser,
} from "@/services/osu-collector-api-hooks";
import * as api from "@/services/osu-collector-api";
import { useState } from "react";
import moment from "moment";
import Image from "next/image";
import { useToast } from "@/components/shadcn/use-toast";

const isPaypalOrStripeSubscriptionActive = (user, paypalSubscription, stripeSubscription) => {
  if (user?.private?.subscriptionExpiryDate) {
    const subscriptionExpiryDate = new Date(user.private.subscriptionExpiryDate._seconds * 1000);
    if (subscriptionExpiryDate > new Date()) {
      return true;
    }
  }
  if (paypalSubscription?.status.toLowerCase() === "active") {
    return true;
  }
  if (stripeSubscription?.status.toLowerCase() === "active") {
    return true;
  }
  return false;
};

export interface PaymentDetailsModalProps {
  children: ReactNode;
}
export default function PaymentDetailsModal({ children }: PaymentDetailsModalProps) {
  const { user, mutate: mutateUser } = useUser();
  const { paypalSubscription, mutate: mutatePaypalSubscription } = usePaypalSubscription();
  const { stripeSubscription, mutate: mutateStripeSubscription } = useStripeSubscription();
  const paypalOrStripeSubscriptionActive = isPaypalOrStripeSubscriptionActive(
    user,
    paypalSubscription,
    stripeSubscription
  );

  const showPaypalSubscription = (paypalSubscription, stripeSubscription) => {
    if (!paypalSubscription) {
      return false;
    }
    if (paypalSubscription.status.toLowerCase() === "active") {
      return true;
    }
    // status: cancelled or expired or other
    if (!stripeSubscription) {
      return true;
    } else if (stripeSubscription.status === "active") {
      return false;
    } else {
      // status: (cancelled or expired or other) for BOTH subscriptions
      // show the one that is more recent
      const paypalSubscriptionDateCreated = new Date(paypalSubscription.create_time);
      const stripeSubscriptionDateCreated = new Date(stripeSubscription.created * 1000);
      return paypalSubscriptionDateCreated > stripeSubscriptionDateCreated;
    }
  };
  const showStripeSubscription = (paypalSubscription, stripeSubscription) => {
    if (!stripeSubscription) {
      return false;
    }
    if (stripeSubscription.status === "active") {
      return true;
    }
    // status: cancelled or expired or other
    if (!paypalSubscription) {
      return true;
    } else if (paypalSubscription.status.toLowerCase() === "active") {
      return false;
    } else {
      // status: (cancelled or expired or other) for BOTH subscriptions
      // show the one that is more recent
      const paypalSubscriptionDateCreated = new Date(paypalSubscription.create_time);
      const stripeSubscriptionDateCreated = new Date(stripeSubscription.created * 1000);
      return stripeSubscriptionDateCreated > paypalSubscriptionDateCreated;
    }
  };

  const paypalEndDate = new Date(
    paypalSubscription?.billing_info.next_billing_time ||
      user?.private?.subscriptionExpiryDate?._seconds * 1000
  );
  const paypalEndDateVerb =
    new Date() > paypalEndDate
      ? "Ended"
      : paypalSubscription?.status.toLowerCase() === "active"
      ? "Renews"
      : "Ends";

  const stripeEndDate = ["canceled", "past_due", "incomplete", "incomplete_expired"].includes(
    stripeSubscription?.status
  )
    ? new Date(user?.private?.subscriptionExpiryDate?._seconds * 1000)
    : new Date(stripeSubscription?.current_period_end * 1000);
  const stripeEndDateVerb =
    new Date() > stripeEndDate
      ? "Ended"
      : stripeSubscription?.cancel_at_period_end
      ? "Ends"
      : stripeSubscription?.status.toLowerCase() === "active"
      ? "Renews"
      : "Ends";
  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl" onPointerDownOutside={close}>
        <DialogHeader>
          <DialogTitle>
            {paypalOrStripeSubscriptionActive ? "Your subscription" : "Your past subscription"}
          </DialogTitle>
        </DialogHeader>

        {!user?.private?.paypalSubscriptionId && !user?.private?.stripeSubscriptionId && (
          <p className="text-slate-400"> Nothing to show </p>
        )}

        {/* PayPal Subscription */}
        {showPaypalSubscription(paypalSubscription, stripeSubscription) && (
          <>
            <SubscriptionDetails
              subscriptionId={paypalSubscription.id}
              status={paypalSubscription.status.toUpperCase()}
              created={new Date(paypalSubscription.create_time)}
              endDateVerb={paypalEndDateVerb}
              endDate={paypalEndDate}
              paymentMethodComponent={
                <div className="flex items-center gap-2 mt-1">
                  <Image
                    src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png"
                    alt="PayPal logo"
                    width={80}
                    height={20}
                  />
                  {paypalSubscription.subscriber.email_address}
                </div>
              }
              cancelSubscriptionApiCall={api.cancelPaypalSubscription}
              canCancelSubscription={paypalSubscription.status.toLowerCase() === "active"}
              mutate={() => {
                mutateUser();
                mutatePaypalSubscription();
              }}
            />
          </>
        )}

        {showPaypalSubscription(paypalSubscription, stripeSubscription) &&
          showStripeSubscription(paypalSubscription, stripeSubscription) && <hr className="my-5" />}

        {/* Stripe Subscription */}
        {showStripeSubscription(paypalSubscription, stripeSubscription) && (
          <>
            <SubscriptionDetails
              subscriptionId={stripeSubscription.id}
              status={
                stripeSubscription.status === "active" && stripeSubscription.cancel_at_period_end
                  ? "Active until end of billing period"
                  : stripeSubscription.status.toUpperCase()
              }
              created={new Date(stripeSubscription.created * 1000)}
              endDateVerb={stripeEndDateVerb}
              endDate={stripeEndDate}
              paymentMethodComponent={
                stripeSubscription?.default_payment_method?.card ? (
                  <div className="flex items-center">
                    {stripeSubscription.default_payment_method.card.brand} ending in{" "}
                    {stripeSubscription.default_payment_method.card.last4}
                  </div>
                ) : (
                  "No current payment method"
                )
              }
              cancelSubscriptionApiCall={api.cancelStripeSubscription}
              canCancelSubscription={
                stripeSubscription.status.toLowerCase() !== "canceled" &&
                !stripeSubscription.cancel_at_period_end
              }
              mutate={() => {
                mutateUser();
                mutateStripeSubscription();
              }}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

const SubscriptionDetails = ({
  subscriptionId,
  status,
  created,
  endDateVerb,
  endDate,
  paymentMethodComponent,
  cancelSubscriptionApiCall,
  canCancelSubscription,
  mutate,
}) => {
  const { toast } = useToast();
  const [showCancelConfirmationModal, setShowCancelConfirmationModal] = useState(false);
  const [cancelSubscription, cancellingSubscription] = useSubmit(async () => {
    try {
      await cancelSubscriptionApiCall();
      toast({ title: "Subscription cancelled" });
    } finally {
      mutate();
    }
    setShowCancelConfirmationModal(false);
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex">
          <div className="w-1/2">
            <div>
              <small className="text-slate-400">Subscription number</small>
            </div>
            <div>{subscriptionId}</div>
          </div>
          <div className="w-1/2">
            <div>
              <small className="text-slate-400">Status</small>
            </div>
            <div className="flex items-center">{status}</div>
          </div>
        </div>
        <hr className="my-4" />
        <div className="flex">
          <div className="w-1/2">
            <div>
              <small className="text-slate-400">Created on</small>
            </div>
            <div>{moment(created).format("MMMM Do, YYYY")}</div>
          </div>
          <div className="w-1/2">
            <div>
              <small className="text-slate-400">{endDateVerb} on</small>
            </div>
            <div>{endDate ? moment(endDate).format("MMMM Do, YYYY") : "---"}</div>
          </div>
        </div>
        <hr className="my-4" />
        <div className="flex">
          <div className="w-1/2">
            <div>
              <small className="text-slate-400">Subscription fee</small>
            </div>
            <div>$1.99 USD per month</div>
          </div>
          <div className="w-1/2">
            <div>
              <small className="text-slate-400">Payment method</small>
            </div>
            {paymentMethodComponent}
          </div>
        </div>
      </div>

      {canCancelSubscription && (
        <div className="flex items-center justify-end gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                Change payment method
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Notice</DialogTitle>
              <DialogDescription>
                If you&apos;d like to change your payment method, please cancel your subscription,
                then create a new subscription with the new payment method after the old
                subscription ends.
              </DialogDescription>
              <DialogClose>
                <Button variant="outline">Ok</Button>
              </DialogClose>
            </DialogContent>
          </Dialog>
          <Dialog
            open={showCancelConfirmationModal}
            onOpenChange={(open) => setShowCancelConfirmationModal(open)}
          >
            <DialogTrigger asChild>
              <Button size="sm" variant="destructive">
                Cancel subscription
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmation</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                Are you sure you would like to cancel your subscription?
              </DialogDescription>
              <div className="flex items-center gap-2">
                <DialogClose>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={cancelSubscription}
                  loading={cancellingSubscription}
                >
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};
