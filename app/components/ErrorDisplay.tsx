import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Button,
  VStack,
  Text,
  Collapse,
} from "@chakra-ui/react";
import { useState } from "react";

interface ErrorDisplayProps {
  title: string;
  message: string;
  details?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export function ErrorDisplay({
  title,
  message,
  details,
  onRetry,
  showRetry = true,
}: ErrorDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Box p={6}>
      <Alert status="error" variant="left-accent" borderRadius="md">
        <AlertIcon />
        <Box flex="1">
          <AlertTitle>
            <Text variant="strong">{title}</Text>
          </AlertTitle>
          <AlertDescription display="block" mt={2}>
            <Text variant="default">{message}</Text>
          </AlertDescription>
        </Box>
      </Alert>

      {details && (
        <VStack mt={4} spacing={3} align="stretch">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            <Text variant="small">
              {showDetails ? "Hide" : "Show"} Details
            </Text>
          </Button>
          
          <Collapse in={showDetails}>
            <Box
              p={3}
              bg="gray.50"
              borderRadius="md"
              border="1px"
              borderColor="gray.200"
            >
              <Text variant="small" fontFamily="mono">
                {details}
              </Text>
            </Box>
          </Collapse>
        </VStack>
      )}

      {showRetry && onRetry && (
        <Box mt={4}>
          <Button colorScheme="blue" size="sm" onClick={onRetry}>
            <Text variant="small">Retry</Text>
          </Button>
        </Box>
      )}
    </Box>
  );
}