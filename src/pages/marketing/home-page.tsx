import {
  ArrowRightIcon,
  Bookmark,
  Headset,
} from 'lucide-react'

import { APP_LOGIN_URL } from '@/features/auth'
import { HeroChatPreview } from '@/features/marketing'
import { WhatsAppIcon } from '@/shared/components/icons/whatsapp-icon'
import { Button } from '@/shared/components/ui/button'

export function HomePage() {
  return (
    <main className="relative -mt-16 overflow-x-clip pt-16">
      <HeroGodRays />
      {/* 1. HERO SECTION */}
      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-10 pt-12 pb-20 lg:grid-cols-2 lg:gap-8 lg:pt-18 lg:pb-6">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <h1 className="max-w-xl text-balance text-display text-foreground">
            Turn Your WhatsApp into an <span className="font-black">AI Sales</span> &amp;{' '} <span className="italic">Support Agent</span>
          </h1>

          <ul className="mx-auto mt-8 grid w-fit max-w-xl grid-cols-[repeat(2,max-content)] justify-center gap-x-6 gap-y-3 text-body-sm text-muted-foreground sm:mx-0 sm:grid-cols-[repeat(3,minmax(0,max-content))] sm:justify-start sm:gap-x-8 sm:gap-y-4 sm:text-left">
            <li className="flex items-center gap-1.5 whitespace-nowrap sm:items-start sm:gap-2.5">
              <Headset className="size-4 shrink-0 text-primary sm:mt-0.5 sm:size-5" aria-hidden="true" />
              <span>Service 24/7</span>
            </li>
            <li className="flex items-center gap-1.5 whitespace-nowrap sm:items-start sm:gap-2.5">
              <Bookmark className="size-4 shrink-0 text-primary sm:mt-0.5 sm:size-5" aria-hidden="true" />
              <span>Manage Clients</span>
            </li>
            <li className="col-span-2 flex items-center justify-self-center gap-1.5 whitespace-nowrap sm:col-span-1 sm:items-start sm:justify-self-auto sm:gap-2.5">
              <WhatsAppIcon className="size-4 shrink-0 text-primary sm:mt-0.5 sm:size-5" aria-hidden="true" />
              <span>WhatsApp API</span>
            </li>
          </ul>

          <div className="mt-8 flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
            <Button size="lg" variant="secondary" asChild>
              <a href={APP_LOGIN_URL}>
                Connect your WhatsApp
                <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
              </a>
            </Button>

            <Button size="lg" variant="outline" asChild>
              <a href="#pricing">See Prices</a>
            </Button>
          </div>
        </div>

        <div className="w-full">
          <HeroChatPreview />
        </div>
      </section>

      {/* TODO: Section 2 - Client Logos (Any real logo is better that none. If none a single quote or testimonial) */}

      {/* TODO: Section 3 - Video to answer objections upfront (Address customer's biggest fears and make a small list of those answers) */}

      {/* TODO: Section 4 - More testimonials (Videos testimonials are the best or text and image. If no image quote from an external provider like google reviews) */}

      {/* TODO: Section 5 - Services, Features, Or Benefits (Carrousel or list of features of URPI at a glance each use case must have its page where more detailed explanations are given. A CTA to Contact for more info ) */}

      {/* TODO: Section 6 - Show the results (A list or Carrousel of Brands that I have worked with and the positive resultas / stats achieved, a study case button if more info can be shown) */}

      {/* TODO: Section 7 - How Urpi works / Urpi's methodoly (A maximum of 5 steps to explain how urpi creates success what i gonna do for you to overcome hesitation. A video if possible)  */}

      {/* TODO: Section 8 - FAQ (Try adding the questions that client's can came up with)  */}

      {/* TODO: Section 9 - CTA for users to register */}
    </main>
  )
}

function HeroGodRays() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -top-32 right-[8%] h-140 w-52 motion-safe:animate-[ray-drift_10s_linear_infinite] bg-linear-to-b from-primary/35 via-chart-3/18 to-transparent blur-2xl dark:from-secondary/28 dark:via-chart-3/16" />

      <div className="absolute -top-24 right-[24%] h-125 w-40 motion-safe:animate-[ray-drift_13s_linear_-4s_infinite] bg-linear-to-b from-chart-3/30 via-primary/15 to-transparent blur-2xl dark:from-chart-2/22 dark:via-chart-3/12" />

      <div className="absolute -top-20 right-[40%] h-110 w-28 motion-safe:animate-[ray-drift_9s_linear_-7s_infinite] bg-linear-to-b from-primary/25 via-chart-3/10 to-transparent blur-xl dark:from-secondary/18 dark:via-chart-2/10" />

      <div className="absolute -top-28 left-[20%] h-120 w-36 motion-safe:animate-[ray-drift_15s_linear_-10s_infinite] bg-linear-to-b from-primary/28 via-chart-3/14 to-transparent blur-2xl dark:from-secondary/22 dark:via-chart-3/12" />
    </div>
  )
}