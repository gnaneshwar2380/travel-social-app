with open('api/views.py', 'r') as f:
    content = f.read()

# Fix 1 - FollowingFeedView
old1 = '''class FollowingFeedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        following_ids = Follow.objects.filter(follower=request.user).values_list('following_id', flat=True)
        posts = ExperiencePost.objects.filter(author_id__in=following_ids).order_by('-created_at')
        serializer = ExperiencePostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)'''

new1 = '''class FollowingFeedView(APIView):
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

if old1 in content:
    content = content.replace(old1, new1)
    print("Fix 1 - FollowingFeedView DONE")
else:
    print("Fix 1 - NOT FOUND")

# Fix 2 - ChatView mark as read
old2 = '''    def get(self, request, user_id):
        messages = Message.objects.filter(
            Q(sender=request.user, receiver_id=user_id) |
            Q(sender_id=user_id, receiver=request.user)
        ).order_by('created_at')
        serializer = MessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)'''

new2 = '''    def get(self, request, user_id):
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

if old2 in content:
    content = content.replace(old2, new2)
    print("Fix 2 - ChatView mark read DONE")
else:
    print("Fix 2 - NOT FOUND")

# Fix 3 - Comment notification
old3 = '''        ct = ContentType.objects.get_for_model(obj)
        comment = Comment.objects.create(
            user=request.user,
            content_type=ct,
            object_id=obj.id,
            text=request.data.get('text', '')
        )
        return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)'''

new3 = '''        ct = ContentType.objects.get_for_model(obj)
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

if old3 in content:
    content = content.replace(old3, new3)
    print("Fix 3 - Comment notification DONE")
else:
    print("Fix 3 - NOT FOUND")

# Fix 4 - Accept notification text
old4 = '''        Notification.objects.create(
            sender=request.user,
            receiver=join_request.user,
            notification_type='request_accepted',
            content_type=ContentType.objects.get_for_model(join_request),
            object_id=join_request.id
        )'''

new4 = '''        Notification.objects.create(
            sender=request.user,
            receiver=join_request.user,
            notification_type='request_accepted',
            text=f"{request.user.username} accepted your request to join '{join_request.trip.title}'",
            content_type=ContentType.objects.get_for_model(join_request),
            object_id=join_request.id
        )'''

if old4 in content:
    content = content.replace(old4, new4)
    print("Fix 4 - Accept notification text DONE")
else:
    print("Fix 4 - NOT FOUND")

# Fix 5 - Remove duplicate class definitions
for cls_name in ['class TripGroupListView', 'class TripGroupChatView', 'class TripGroupMembersView']:
    first = content.find(cls_name)
    second = content.find(cls_name, first + 1)
    if second != -1:
        end = content.find('\nclass ', second + 1)
        if end == -1:
            end = len(content)
        content = content[:second] + content[end:]
        print(f"Fix 5 - Removed duplicate {cls_name}")

with open('api/views.py', 'w') as f:
    f.write(content)

print("\nAll done! Run: python manage.py runserver")