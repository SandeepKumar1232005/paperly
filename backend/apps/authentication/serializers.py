from rest_framework import serializers

class UserSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    email = serializers.EmailField()
    name = serializers.CharField(required=False)
    role = serializers.CharField(read_only=True)
    # Add other fields as needed matching the PyMongo document structure
