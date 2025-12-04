'use client'

import { useState } from 'react'
import { FileText, Star, FileEdit } from 'lucide-react'
import PromptCard from '@/components/prompts/prompt-card'
import { Category } from '@/lib/constants'

interface SerializedPrompt {
  _id: string
  title: string
  description: string
  promptContent: string
  category: Category
  tags: string[]
  outputFormat: 'markdown' | 'json'
  authorId: string
  authorName: string
  isPublic: boolean
  parentPromptId: string | null
  forkCount: number
  viewCount: number
  starCount: number
  starredBy: string[]
  versionNumber: number
  createdAt: string
  updatedAt: string
}

interface LibraryTabsProps {
  myPrompts: SerializedPrompt[]
  starredPrompts: SerializedPrompt[]
}

type TabType = 'my-prompts' | 'starred' | 'drafts'

export default function LibraryTabs({ myPrompts, starredPrompts }: LibraryTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('my-prompts')

  const tabs = [
    {
      id: 'my-prompts' as TabType,
      label: 'My Prompts',
      icon: FileText,
      count: myPrompts.length,
      prompts: myPrompts,
    },
    {
      id: 'starred' as TabType,
      label: 'Starred',
      icon: Star,
      count: starredPrompts.length,
      prompts: starredPrompts,
    },
    {
      id: 'drafts' as TabType,
      label: 'Drafts',
      icon: FileEdit,
      count: myPrompts.filter((p) => !p.isPublic).length,
      prompts: myPrompts.filter((p) => !p.isPublic),
    },
  ]

  const currentTab = tabs.find((tab) => tab.id === activeTab)!

  return (
    <div>
      {/* Tab Headers */}
      <div className="mb-6 flex gap-4 border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div>
        {currentTab.prompts.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <currentTab.icon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              No {currentTab.label.toLowerCase()} yet
            </h3>
            <p className="text-sm text-muted-foreground">
              {activeTab === 'my-prompts' && 'Create your first prompt to get started'}
              {activeTab === 'starred' && 'Star prompts to save them here'}
              {activeTab === 'drafts' && 'Private prompts will appear here'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {currentTab.prompts.map((prompt) => (
              <PromptCard key={prompt._id} prompt={prompt} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
