with open('api/views.py', 'r') as f:
    content = f.read()

# Fix 1 - FollowingFeedView - add all 3 post types
old_following = '''class FollowingFeedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        following_ids = Follow.objects.filter(follower=request.user).values_list('following_id', flat=True)
        posts = ExperiencePost.objects.filter(author_id__in=following_ids).order_by('-created_at')
        serializer = ExperiencePostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)'''

new_following = '''class FollowingFeedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        following_ids = Follow.objects.filter(follower=request.user).values_list('following_id', flat=True)
        feed = []
        for post in ExperiencePost.objects.filter(author_id__in=following_ids).order_by('-created_at')[:20]:
            data = ExperiencePostSerializer(post, context={'request': request}).data
            data['post_type'] = 'experience'
            feed.append(data)
        for post in GeneralPost.objects.filter(author_id__in=following_ids).order_by('-created_at')[:20]:
            data = GeneralPostSerializer(post, context={'request': request}).data
            data['post_type'] = 'general'
            feed.append(data)
        for post in JoinableTripPost.objects.filter(creator_id__in=following_ids).order_by('-created_at')[:20]:
            data = JoinableTripPostSerializer(post, context={'request': request}).data
            data['post_type'] = 'joinable'
            feed.append(data)
        feed.sort(key=lambda x: x['created_at'], reverse=True)
        return Response(feed)'''

if old_following in content:
    content = content.replace(old_following, new_following)
    print("Fix 1 - FollowingFeedView fixed!")
else:
    print("Fix 1 - FollowingFeedView NOT FOUND")

# Fix 2 - ChatView - mark messages as read
old_chat = '''class ChatView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        messages = Message.objects.filter(
            Q(sender=request.user, receiver_id=user_id) |
            Q(sender_id=user_id, receiver=request.user)
        ).order_by('created_at')
        serializer = MessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)'''

new_chat = '''class ChatView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        Message.objects.filter(
            sender_id=user_id,
            receiver=request.user,
            is_read=False
        ).update(is_read=True)
        messages = Message.objects.filter(
            Q(sender=request.user, receiver_id=user_id) |
            Q(sender_id=user_id, receiver=request.user)
        ).order_by('created_at')
        serializer = MessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)'''

if old_chat in content:
    content = content.replace(old_chat, new_chat)
    print("Fix 2 - ChatView fixed!")
else:
    print("Fix 2 - ChatView NOT FOUND")

# Fix 3 - CommentListCreateView - add notification
old_comment_post = '''        ct = ContentType.objects.get_for_model(obj)
        comment = Comment.objects.create(
            user=request.user,
            content_type=ct,
            object_id=obj.id,
            text=request.data.get('text', '')
        )
        return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)'''

new_comment_post = '''        ct = ContentType.objects.get_for_model(obj)
        comment = Comment.objects.create(
            user=request.user,
            content_type=ct,
            object_id=obj.id,
            text=request.data.get('text', '')
        )
        author = getattr(obj, 'author', None) or getattr(obj, 'creator', None)
        if author and author != request.user:
            Notification.objects.create(
                sender=request.user,
                receiver=author,
                notification_type='comment',
                text=f"{request.user.username} commented on your post"
            )
        return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)'''

if old_comment_post in content:
    content = content.replace(old_comment_post, new_comment_post)
    print("Fix 3 - Comment notification fixed!")
else:
    print("Fix 3 - Comment post NOT FOUND")

# Fix 4 - Remove duplicate TripGroupListView, TripGroupChatView, TripGroupMembersView
# They appear twice - remove the second occurrence
for cls in ['class TripGroupListView', 'class TripGroupChatView', 'class TripGroupMembersView']:
    first = content.find(cls)
    second = content.find(cls, first + 1)
    if second != -1:
        end = content.find('\nclass ', second + 1)
        if end == -1:
            end = len(content)
        content = content[:second] + content[end:]
        print(f"Fix 4 - Removed duplicate {cls}")

# Fix 5 - JoinableTripAcceptView - add text to notification
old_accept_notif = '''        Notification.objects.create(
            sender=request.user,
            receiver=join_request.user,
            notification_type='request_accepted',
            content_type=ContentType.objects.get_for_model(join_request),
            object_id=join_request.id
        )'''

new_accept_notif = '''        Notification.objects.create(
            sender=request.user,
            receiver=join_request.user,
            notification_type='request_accepted',
            text=f"{request.user.username} accepted your request to join the trip '{join_request.trip.title}'",
            content_type=ContentType.objects.get_for_model(join_request),
            object_id=join_request.id
        )'''

if old_accept_notif in content:
    content = content.replace(old_accept_notif, new_accept_notif)
    print("Fix 5 - Accept notification text fixed!")
else:
    print("Fix 5 - Accept notification NOT FOUND")

with open('api/views.py', 'w') as f:
    f.write(content)

print("\nAll fixes applied! Run: python manage.py runserver")