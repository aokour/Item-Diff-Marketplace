import { Box, Spinner, Text, VStack, Progress } from "@chakra-ui/react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showProgress?: boolean;
  progressValue?: number;
}

export function LoadingSpinner({ 
  message = "Loading...", 
  size = "lg",
  showProgress = false,
  progressValue
}: LoadingSpinnerProps) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="200px"
      p={6}
    >
      <VStack spacing={4} w="full" maxW="400px">
        {showProgress && progressValue !== undefined ? (
          <VStack spacing={3} w="full">
            <Progress 
              value={progressValue} 
              size="md" 
              colorScheme="blue" 
              w="full"
              hasStripe
              isAnimated
            />
            <Text variant="small" color="blue.600">
              {Math.round(progressValue)}%
            </Text>
          </VStack>
        ) : (
          <Spinner
            thickness="3px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size={size}
          />
        )}
        <Text variant="subtle" textAlign="center">
          {message}
        </Text>
      </VStack>
    </Box>
  );
}