old = '''class FollowingFeedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        following_ids = Follow.objects.filter(follower=request.user).values_list('following_id', flat=True)
        posts = ExperiencePost.objects.filter(author_id__in=following_ids).order_by('-created_at')
        serializer = ExperiencePostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)'''

new = '''class FollowingFeedView(APIView):
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

with open('api/views.py', 'r') as f:
    content = f.read()

if old in content:
    content = content.replace(old, new)
    with open('api/views.py', 'w') as f:
        f.write(content)
    print("FollowingFeedView fixed!")
else:
    print("NOT FOUND - check manually")