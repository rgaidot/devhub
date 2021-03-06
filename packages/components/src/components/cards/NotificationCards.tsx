import React from 'react'
import { FlatList, View } from 'react-native'

import { EnhancedGitHubNotification, LoadState } from '@devhub/core'
import { useAnimatedTheme } from '../../hooks/use-animated-theme'
import { ErrorBoundary } from '../../libs/bugsnag'
import { contentPadding } from '../../styles/variables'
import { AnimatedTransparentTextOverlay } from '../animated/AnimatedTransparentTextOverlay'
import { Button } from '../common/Button'
import { EmptyCards, EmptyCardsProps } from './EmptyCards'
import { NotificationCard } from './NotificationCard'
import { CardItemSeparator } from './partials/CardItemSeparator'
import { SwipeableNotificationCard } from './SwipeableNotificationCard'

export interface NotificationCardsProps {
  errorMessage: EmptyCardsProps['errorMessage']
  fetchNextPage: ((params?: { perPage?: number }) => void) | undefined
  loadState: LoadState
  notifications: EnhancedGitHubNotification[]
  refresh: EmptyCardsProps['refresh']
  repoIsKnown?: boolean
  swipeable?: boolean
}

export const NotificationCards = React.memo((props: NotificationCardsProps) => {
  const theme = useAnimatedTheme()

  const {
    errorMessage,
    fetchNextPage,
    loadState,
    notifications,
    refresh,
  } = props

  if (!(notifications && notifications.length))
    return (
      <EmptyCards
        errorMessage={errorMessage}
        fetchNextPage={fetchNextPage}
        loadState={loadState}
        refresh={refresh}
      />
    )

  function keyExtractor(notification: EnhancedGitHubNotification) {
    return `notification-card-${notification.id}`
  }

  function renderItem({
    item: notification,
  }: {
    item: EnhancedGitHubNotification
  }) {
    if (props.swipeable) {
      return (
        <SwipeableNotificationCard
          notification={notification}
          repoIsKnown={props.repoIsKnown}
        />
      )
    }

    return (
      <ErrorBoundary>
        <NotificationCard
          notification={notification}
          repoIsKnown={props.repoIsKnown}
        />
      </ErrorBoundary>
    )
  }

  function renderFooter() {
    if (!fetchNextPage) return <CardItemSeparator />

    return (
      <>
        <CardItemSeparator />
        <View style={{ padding: contentPadding }}>
          <Button
            analyticsLabel={loadState === 'error' ? 'try_again' : 'load_more'}
            children={loadState === 'error' ? 'Oops. Try again' : 'Load more'}
            disabled={loadState !== 'loaded'}
            loading={loadState === 'loading_more'}
            onPress={() => fetchNextPage()}
          />
        </View>
      </>
    )
  }

  return (
    <AnimatedTransparentTextOverlay
      color={theme.backgroundColor as any}
      size={contentPadding}
      from="vertical"
    >
      <FlatList
        key="notification-cards-flat-list"
        ItemSeparatorComponent={CardItemSeparator}
        ListFooterComponent={renderFooter}
        data={notifications}
        extraData={loadState}
        initialNumToRender={5}
        keyExtractor={keyExtractor}
        maxToRenderPerBatch={5}
        removeClippedSubviews
        renderItem={renderItem}
      />
    </AnimatedTransparentTextOverlay>
  )
})
