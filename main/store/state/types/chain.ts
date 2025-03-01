import { z } from 'zod'
import log from 'electron-log'

import { ConnectionSchema } from './connection'

const layerValues = ['mainnet', 'rollup', 'sidechain', 'testnet'] as const
const type = 'ethereum' as const

export const chainDefaults = {
  1: {
    id: 1,
    type,
    layer: 'mainnet' as const,
    name: 'Mainnet',
    isTestnet: false,
    explorer: 'https://etherscan.io',
    on: true,
    connection: {
      primary: {
        on: true,
        current: 'pylon' as const,
        status: 'loading' as const,
        connected: false,
        custom: ''
      },
      secondary: {
        on: false,
        current: 'custom' as const,
        status: 'loading' as const,
        connected: false,
        custom: ''
      }
    }
  },
  10: {
    id: 10,
    type,
    layer: 'rollup' as const,
    isTestnet: false,
    name: 'Optimism',
    explorer: 'https://optimistic.etherscan.io',
    on: false,
    connection: {
      primary: {
        on: true,
        current: 'pylon' as const,
        status: 'loading' as const,
        connected: false,
        custom: ''
      },
      secondary: {
        on: false,
        current: 'custom' as const,
        status: 'loading' as const,
        connected: false,
        custom: ''
      }
    }
  },
  100: {
    id: 100,
    type,
    layer: 'sidechain' as const,
    isTestnet: false,
    name: 'Gnosis',
    explorer: 'https://blockscout.com/xdai/mainnet',
    on: false,
    connection: {
      primary: {
        on: false,
        current: 'custom' as const,
        status: 'loading' as const,
        connected: false,
        custom: 'https://rpc.gnosischain.com'
      },
      secondary: {
        on: false,
        current: 'custom' as const,
        status: 'loading' as const,
        connected: false,
        custom: ''
      }
    }
  },
  137: {
    id: 137,
    type,
    layer: 'sidechain' as const,
    isTestnet: false,
    name: 'Polygon',
    explorer: 'https://polygonscan.com',
    on: false,
    connection: {
      primary: {
        on: true,
        current: 'pylon' as const,
        status: 'loading' as const,
        connected: false,
        custom: ''
      },
      secondary: {
        on: false,
        current: 'custom' as const,
        status: 'loading' as const,
        connected: false,
        custom: ''
      }
    }
  },
  8453: {
    id: 8453,
    type,
    layer: 'rollup' as const,
    isTestnet: false,
    name: 'Base',
    explorer: 'https://basescan.org',
    connection: {
      primary: {
        on: true,
        current: 'pylon' as const,
        status: 'loading' as const,
        connected: false,
        custom: ''
      },
      secondary: {
        on: false,
        current: 'custom' as const,
        status: 'loading' as const,
        connected: false,
        custom: ''
      }
    },
    on: false
  },
  42161: {
    id: 42161,
    type,
    layer: 'rollup' as const,
    isTestnet: false,
    name: 'Arbitrum',
    explorer: 'https://arbiscan.io',
    on: false,
    connection: {
      primary: {
        on: true,
        current: 'pylon' as const,
        status: 'loading' as const,
        connected: false,
        custom: ''
      },
      secondary: {
        on: false,
        current: 'custom' as const,
        status: 'loading' as const,
        connected: false,
        custom: ''
      }
    }
  },
  84532: {
    id: 84532,
    type,
    layer: 'testnet' as const,
    isTestnet: true,
    name: 'Base Sepolia',
    explorer: 'https://sepolia.basescan.org',
    on: false,
    connection: {
      primary: {
        on: true,
        current: 'pylon' as const,
        status: 'loading' as const,
        connected: false,
        custom: ''
      },
      secondary: {
        on: false,
        current: 'custom' as const,
        status: 'loading' as const,
        connected: false,
        custom: ''
      }
    }
  },
  11155111: {
    id: 11155111,
    type,
    layer: 'testnet' as const,
    isTestnet: true,
    name: 'Sepolia',
    explorer: 'https://sepolia.etherscan.io',
    on: false,
    connection: {
      primary: {
        on: true,
        current: 'pylon' as const,
        status: 'loading' as const,
        connected: false,
        custom: ''
      },
      secondary: {
        on: false,
        current: 'custom' as const,
        status: 'loading' as const,
        connected: false,
        custom: ''
      }
    }
  },
  11155420: {
    id: 11155420,
    type,
    layer: 'testnet' as const,
    isTestnet: true,
    name: 'Optimism Sepolia',
    explorer: 'https://sepolia-optimism.etherscan.io',
    on: false,
    connection: {
      primary: {
        on: true,
        current: 'pylon' as const,
        status: 'loading' as const,
        connected: false,
        custom: ''
      },
      secondary: {
        on: false,
        current: 'custom' as const,
        status: 'loading' as const,
        connected: false,
        custom: ''
      }
    }
  }
}

function getDefaultChain(chainId: keyof typeof chainDefaults) {
  const defaultChain = chainDefaults[chainId]

  // ensure all chains that are replaced in state with a
  // default value are not using any custom RPC presets
  defaultChain.connection.primary.current = 'custom'
  defaultChain.connection.secondary.current = 'custom'

  return defaultChain
}

export const ChainIdSchema = z.object({
  id: z.coerce.number(),
  type: z.literal('ethereum')
})

export const ChainSchema = ChainIdSchema.merge(
  z.object({
    name: z.string(),
    on: z.boolean().default(false),
    connection: z.object({
      primary: ConnectionSchema,
      secondary: ConnectionSchema
    }),
    layer: z.enum(layerValues).optional(),
    isTestnet: z.boolean().default(false),
    explorer: z.string().default('')
  })
)

// create a version of the schema that removes invalid chains, allowing them to
// also be "false" so that we can filter them out later in a transform
const ParsedChainSchema = z.union([ChainSchema, z.boolean()]).catch((ctx) => {
  const { id: chainId } = (ctx.input || {}) as any

  if (chainId in chainDefaults) {
    return getDefaultChain(chainId as keyof typeof chainDefaults)
  }

  return false
})

const ChainsSchema = z
  .record(z.coerce.number(), ParsedChainSchema)
  .transform((parsedChains) => {
    // remove any chains that failed to parse, which will now be set to "false"
    const chains = Object.fromEntries(
      Object.entries(parsedChains).filter(([id, chain]) => {
        if (chain === false) {
          log.info(`State parsing: removing invalid chain ${id} from state`)
          return false
        }

        return true
      })
    ) as Record<string, Chain>

    // add mainnet if it's not already there
    return {
      ...chains,
      1: chains['1'] || getDefaultChain(1)
    }
  })
  .transform((chains) => {
    const disconnectedChains = Object.entries(chains).map(([id, chain]) => {
      // all chains should start disconnected by default
      return [
        id,
        {
          ...chain,
          connection: {
            ...chain.connection,
            primary: {
              ...chain.connection.primary,
              connected: false
            },
            secondary: {
              ...chain.connection.secondary,
              connected: false
            }
          }
        }
      ]
    })

    return Object.fromEntries(disconnectedChains)
  })

export const EthereumChainsSchema = z.object({
  ethereum: ChainsSchema
})

export type ChainId = z.infer<typeof ChainIdSchema>
export type Chain = z.infer<typeof ChainSchema>
